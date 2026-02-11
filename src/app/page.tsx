import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦜</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnSmart
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 font-medium">Testimonials</a>
              <Link href="/auth/login" className="text-gray-700 hover:text-purple-600 font-medium">
                Sign In
              </Link>
              <Link 
                href="/onboarding"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-8xl mb-6 animate-bounce">🦜</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Master Spanish with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered</span> Learning
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The most engaging Spanish learning platform for schools and individuals. 
            Interactive lessons, real-time feedback, and proven results.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/onboarding"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Start Learning Free →
            </Link>
            <Link 
              href="/auth/signup?type=teacher"
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all shadow-xl border-2 border-purple-200"
            >
              For Teachers & Schools
            </Link>
          </div>
          <p className="mt-4 text-gray-500">No credit card required • 5 free lessons monthly</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">2K+</div>
              <div className="text-gray-600">Teachers</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Schools</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">Why Choose LearnSmart?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized Learning</h3>
              <p className="text-gray-600">AI-powered placement tests and adaptive lessons match your exact skill level and learning pace.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect for Teachers</h3>
              <p className="text-gray-600">Create custom lessons, assign homework, track progress, and grade assignments all in one place.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gamified Experience</h3>
              <p className="text-gray-600">Streaks, points, and achievements make learning Spanish fun and addictive.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile Ready</h3>
              <p className="text-gray-600">Learn anywhere, anytime on any device with our responsive design.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Analytics</h3>
              <p className="text-gray-600">Teachers and students get detailed insights into progress and areas for improvement.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Results</h3>
              <p className="text-gray-600">95% of students improve by at least one proficiency level within 3 months.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">What Teachers & Students Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  MS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Maria Santos</div>
                  <div className="text-sm text-gray-600">High School Teacher</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"LearnSmart has transformed how I teach Spanish. The automated grading saves me hours every week, and my students are more engaged than ever!"</p>
              <div className="mt-4 text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  JL
                </div>
                <div>
                  <div className="font-bold text-gray-900">Jake Lin</div>
                  <div className="text-sm text-gray-600">10th Grade Student</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"I went from struggling with basics to holding conversations in just 2 months! The interactive lessons make it feel like a game, not homework."</p>
              <div className="mt-4 text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  DR
                </div>
                <div>
                  <div className="font-bold text-gray-900">Dr. Robert Chen</div>
                  <div className="text-sm text-gray-600">Principal, Lincoln HS</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Our Spanish department's test scores improved 40% after adopting LearnSmart. Best investment we've made in years!"</p>
              <div className="mt-4 text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">$0<span className="text-xl text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 5 lessons per month</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic vocabulary</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Mobile app access</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Community support</li>
              </ul>
              <Link href="/onboarding" className="block w-full bg-gray-200 text-gray-700 text-center py-3 rounded-xl font-bold hover:bg-gray-300">
                Get Started
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-5xl font-bold text-white mb-4">$12<span className="text-xl text-white/80">/mo</span></div>
              <ul className="space-y-3 mb-8 text-white">
                <li className="flex items-center gap-2"><span>✓</span> Unlimited lessons</li>
                <li className="flex items-center gap-2"><span>✓</span> Advanced grammar</li>
                <li className="flex items-center gap-2"><span>✓</span> AI conversation practice</li>
                <li className="flex items-center gap-2"><span>✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span>✓</span> Progress tracking</li>
                <li className="flex items-center gap-2"><span>✓</span> Offline mode</li>
              </ul>
              <Link href="/onboarding" className="block w-full bg-white text-purple-600 text-center py-3 rounded-xl font-bold hover:bg-gray-100">
                Start Free Trial
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Schools</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">$10<span className="text-xl text-gray-600">/mo</span></div>
              <p className="text-sm text-gray-600 mb-4">per teacher</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Everything in Pro</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited students</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Custom lessons</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Assignment grading</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Analytics dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 30-day free trial</li>
              </ul>
              <Link href="/auth/signup?type=teacher" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700">
                Start Teaching
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Master Spanish?</h2>
          <p className="text-2xl text-white/90 mb-8">Join thousands of learners achieving fluency</p>
          <Link 
            href="/onboarding"
            className="inline-block bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105"
          >
            Start Learning Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🦜</span>
                <span className="text-xl font-bold">LearnSmart</span>
              </div>
              <p className="text-gray-400">Making Spanish learning fun and effective for everyone.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 LearnSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}