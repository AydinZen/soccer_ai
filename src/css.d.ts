// Ambient declarations so `tsc` accepts CSS imports that Metro resolves at
// build time (e.g. `import '@/global.css'`, CSS modules on web).
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
