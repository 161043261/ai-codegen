export default function GlobalFooter() {
  return (
    <footer className="mt-10 border-t border-blue-500/10 bg-white/80 py-5 text-center backdrop-blur-sm">
      <p className="m-0 text-sm text-gray-500">
        <a
          href="https://github.com/161043261"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 no-underline transition-colors hover:text-blue-500"
        >
          © {new Date().getFullYear()} AI Codegen. All rights reserved.
        </a>
      </p>
    </footer>
  );
}
