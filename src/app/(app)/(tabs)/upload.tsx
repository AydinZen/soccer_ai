import { useState } from 'react';
import { Alert, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DANGER } from '@/constants/ui';

import { Screen } from '@/components/ui/screen';
import { AnalysisResultPreview } from '@/components/upload/analysis-result-preview';
import { AnalyzingState } from '@/components/upload/analyzing-state';
import { ClipInstructions } from '@/components/upload/clip-instructions';
import { IdentificationForm } from '@/components/upload/identification-form';
import { SubmissionSuccess } from '@/components/upload/submission-success';
import { UploadProgress } from '@/components/upload/upload-progress';
import { VideoPickerPreview, type PickedVideo } from '@/components/upload/video-picker-preview';
import { analyzeVideo } from '@/lib/analyses';
import { extractFrames } from '@/lib/extractFrames';
import { createVideoRecord, uploadVideo } from '@/lib/videos';
import type { AnalysisResult } from '@/types/analysis';
import type { PlayerIdentification } from '@/types/video';

type Step = 'identify' | 'instructions' | 'pick' | 'uploading' | 'analyzing' | 'done';

export default function Upload() {
  const [step, setStep] = useState<Step>('identify');
  const [idData, setIdData] = useState<PlayerIdentification | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function reset() {
    setIdData(null);
    setProgress(0);
    setAnalysis(null);
    setStep('identify');
  }

  async function handleConfirm(video: PickedVideo) {
    if (!idData) return;
    setProgress(0);
    setAnalysis(null);
    setUploadError(null);
    setStep('uploading');

    // Phase 1 — upload the clip + record the row. A failure here returns to pick.
    let videoId: string;
    try {
      const { path } = await uploadVideo(video.uri, setProgress, video.mimeType);
      const record = await createVideoRecord({
        ...idData,
        storage_path: path,
        duration: video.durationSec != null ? Math.round(video.durationSec) : null,
        file_size: video.fileSize,
      });
      videoId = record.id;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setUploadError(message);
      setStep('pick');
      return;
    }

    // Phase 2 — extract frames on-device and run AI analysis. The clip is safely
    // uploaded by now, so a failure here still lands on 'done' (with a fallback
    // message) rather than discarding the upload.
    setStep('analyzing');
    try {
      const frames = await extractFrames(video.uri, video.durationSec);
      const result = await analyzeVideo(videoId, frames);
      setAnalysis(result.result ?? null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Analysis could not be completed.';
      // Non-fatal: the clip is uploaded; show the success/queued screen instead.
      console.warn('Analysis failed:', message);
      setAnalysis(null);
    }
    setStep('done');
  }

  // Wizard steps and the rich results view scroll; the centered status views don't.
  const scroll =
    step === 'identify' ||
    step === 'instructions' ||
    step === 'pick' ||
    (step === 'done' && !!analysis);

  return (
    <Screen scroll={scroll}>
      {step === 'identify' && (
        <IdentificationForm
          initial={idData}
          onSubmit={(data) => {
            setIdData(data);
            setStep('instructions');
          }}
        />
      )}
      {step === 'instructions' && (
        <ClipInstructions onContinue={() => setStep('pick')} onBack={() => setStep('identify')} />
      )}
      {step === 'pick' && (
        <>
          {uploadError ? (
            <View style={{ marginBottom: 8 }}>
              <ThemedText type="small" style={{ color: DANGER }}>
                Upload failed: {uploadError}
              </ThemedText>
            </View>
          ) : null}
          <VideoPickerPreview onConfirm={handleConfirm} onBack={() => setStep('instructions')} />
        </>
      )}
      {step === 'uploading' && <UploadProgress progress={progress} />}
      {step === 'analyzing' && <AnalyzingState />}
      {step === 'done' &&
        (analysis ? (
          <AnalysisResultPreview result={analysis} onUploadAnother={reset} />
        ) : (
          <SubmissionSuccess onUploadAnother={reset} />
        ))}
    </Screen>
  );
}
