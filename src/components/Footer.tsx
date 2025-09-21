import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import MaxWidthWrapper from "./utility/MaxWidthWrapper";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <MaxWidthWrapper>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <p className="text-xl font-semibold tracking-tight text-gray-300 underline">
            AutoQuest
          </p>

          {/* Simple Links */}
          <nav className="flex space-x-6 text-sm">
            <a href="/about" className="hover:text-white transition">
              About
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>
            <a href="/faq" className="hover:text-white transition">
              FAQ
            </a>
          </nav>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AutoQuest. All rights reserved.
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
