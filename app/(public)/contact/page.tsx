import type { Metadata } from "next";
import { Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - ApplyPro",
  description: "Get in touch with ApplyPro support team",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Have questions? We're here to help!
          </p>

          {/* Contact Information */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200 animate-scaleIn">
            <div className="flex flex-col items-center space-y-8">
              {/* Email Section */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Email Us
                </h2>
                <a
                  href="mailto:support@applypro.org"
                  className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors underline decoration-2 underline-offset-4"
                >
                  support@applypro.org
                </a>
              </div>

              <div className="w-full max-w-md h-px bg-gray-200"></div>

              {/* Response Time Section */}
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Response Time
                </h3>
                <p className="text-lg text-gray-600">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Additional Help Text */}
          <div className="mt-12">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 inline-block animate-fadeInUp delay-200">
              <p className="text-sm text-gray-700">
                <strong className="text-gray-900">Tip:</strong> For technical
                issues with your resume generation, please include your license
                key in your email to help us assist you faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
