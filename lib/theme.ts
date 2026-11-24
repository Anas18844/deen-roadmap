/** Inline, runs before paint so a saved choice never flashes the wrong theme. */
export const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;
