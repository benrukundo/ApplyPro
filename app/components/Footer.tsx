import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {currentYear}{" "}
              <span className="font-semibold text-white">ApplyPro</span>. AI-Powered
              Resume Tailoring
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/terms"
              className="hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>

          {/* Right: Contact */}
          <div className="text-center md:text-right">
            <p className="text-sm">
              Contact:{" "}
              <a
                href="mailto:support@applypro.org"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                support@applypro.org
              </a>
            </p>
          </div>
        </div>

        {/* Bottom: Powered by */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <a
              href="https://www.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Anthropic Claude AI
            </a>
            {" • "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Hosted on Vercel
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
