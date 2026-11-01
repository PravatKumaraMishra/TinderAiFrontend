export default function AppFooter() {
  return <footer className="app-footer">
    <nav className="footer-links" aria-label="Footer">
      <a href="https://github.com/PravatKumaraMishra/TinderAiFrontend" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="mailto:me.sanuvai@gmail.com">Contact</a>
      <span>Made with ❤️ by <a href="https://github.com/PravatKumaraMishra" target="_blank" rel="noopener noreferrer">Pravat Kumar Mishra</a></span>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </nav>
    <a className="coffee-button" href="https://buymeacoffee.com/pravat_io" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">☕</span> Buy me a coffee</a>
  </footer>;
}
