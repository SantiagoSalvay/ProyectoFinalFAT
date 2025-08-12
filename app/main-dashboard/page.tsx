"use client"

import Link from "next/link"
import UserDropdown from "@/components/UserDropdown"

export default function MainDashboardPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#73e4fd] px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-4">
            <Link
              href="/podio"
              className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
            >
              PODIO
            </Link>
            <Link
              href="/foro"
              className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
            >
              FORO
            </Link>
            <Link
              href="/donar"
              className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
            >
              DONAR
            </Link>
            <Link
              href="/mapa"
              className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
            >
              MAPA
            </Link>
            <Link
              href="/ia"
              className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
            >
              IA
            </Link>
          </nav>

          {/* User Profile */}
          <UserDropdown />
        </div>
      </header>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side geometric shapes */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <svg width="200" height="400" viewBox="0 0 200 400" className="opacity-60">
            {/* Main geometric shape */}
            <polygon points="50,100 150,50 180,150 120,200 30,180" fill="#2b555f" opacity="0.7" />
            <polygon points="20,200 120,150 150,250 90,300 10,280" fill="#73e4fd" opacity="0.8" />

            {/* Heart pin */}
            <circle cx="80" cy="120" r="25" fill="#2b555f" />
            <path
              d="M80,105 C75,100 65,100 65,110 C65,115 80,130 80,130 C80,130 95,115 95,110 C95,100 85,100 80,105 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Right side geometric shapes */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <svg width="200" height="400" viewBox="0 0 200 400" className="opacity-60">
            <polygon points="50,100 150,50 180,150 120,200 30,180" fill="#00445d" opacity="0.6" />
            <polygon points="70,200 170,150 200,250 140,300 60,280" fill="#73e4fd" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Announcements Section */}
          <div className="bg-[#73e4fd] rounded-t-2xl">
            <div className="bg-[#2b555f] text-white text-center py-4 rounded-t-2xl">
              <h1 className="text-3xl md:text-4xl font-bold">ANUNCIOS</h1>
            </div>

            <div className="p-6 space-y-6">
              {/* Announcement Card 1 */}
              <div className="bg-white bg-opacity-90 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Manos unidas"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold text-[#2b555f] mb-4">MANOS UNIDAS</h2>
                    <p className="text-[#2b555f] leading-relaxed">
                      Gente solidaria colabora con donaciones, brindando apoyo a quienes más lo necesitan. Cada aporte
                      es un acto de amor que transforma realidades y genera esperanza en comunidades vulnerables.
                    </p>
                  </div>
                </div>
              </div>

              {/* Announcement Card 2 */}
              <div className="bg-white bg-opacity-90 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Manos unidas"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold text-[#2b555f] mb-4">MANOS UNIDAS</h2>
                    <p className="text-[#2b555f] leading-relaxed">
                      Gente solidaria colabora con donaciones, brindando apoyo a quienes más lo necesitan. Cada aporte
                      es un acto de amor que transforma realidades y genera esperanza en comunidades vulnerables.
                    </p>
                  </div>
                </div>
              </div>

              {/* Announcement Card 3 */}
              <div className="bg-white bg-opacity-90 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Manos unidas"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold text-[#2b555f] mb-4">MANOS UNIDAS</h2>
                    <p className="text-[#2b555f] leading-relaxed">
                      Gente solidaria colabora con donaciones, brindando apoyo a quienes más lo necesitan. Cada aporte
                      es un acto de amor que transforma realidades y genera esperanza en comunidades vulnerables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold text-[#2b555f] mb-4">DEMOS+</div>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Use cases */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Use cases</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    UI design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    UX design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Wireframing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Diagramming
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Brainstorming
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Online whiteboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Team collaboration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Design
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Prototyping
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Development features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Design systems
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Collaboration features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Design process
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    FigJam
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Best practices
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Colors
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Color wheel
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Developers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2b555f]">
                    Resource library
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
