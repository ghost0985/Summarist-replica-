"use client";

import React, { useState } from "react";
import { AiFillFileText, AiFillBulb, AiFillAudio } from "react-icons/ai";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { BiCrown } from "react-icons/bi";
import { RiLeafLine } from "react-icons/ri";
import ThemeToggle from "../components/layout/ThemeToggle";
import StatsController from "@/components/stats/StatsController";
import StatsHighlight from "@/components/stats/StatsHighlight";
import LoginModal from "@/components/auth/LoginModal";
import { Star } from "lucide-react";

export default function HomePage() {
  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <main className="font-sans text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="h-10 dark:bg-white dark:rounded-md dark:px-1 transition-all duration-300"
          />
          <ul className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium items-center">
            <li
              onClick={() => setLoginOpen(true)}
              className="hover:text-green-400 cursor-pointer"
            >
              Login
            </li>
            <li className="cursor-not-allowed hidden md:block">About</li>
            <li className="cursor-not-allowed hidden md:block">Contact</li>
            <li className="cursor-not-allowed hidden md:block">Help</li>
            <ThemeToggle />
          </ul>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />

      {/* Landing Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          {/* Text Section */}
          <div className="flex flex-col justify-center items-center md:items-start w-full md:w-1/2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-gray-900 dark:text-gray-100 mb-6">
              Gain more knowledge in less time
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-md mb-6">
              Great summaries for busy people, individuals who barely have time
              to read, and even people who don’t like to read.
            </p>
            <button
              className="w-full sm:w-64 py-3 bg-green-400 text-black dark:text-white dark:bg-green-600 rounded-md font-semibold hover:bg-green-500 dark:hover:bg-green-700 transition-all"
              onClick={() => setLoginOpen(true)}
            >
              Login
            </button>
          </div>

          {/* Illustration — hidden on small screens */}
          <div className="hidden md:flex justify-center w-full md:w-1/2">
            <img
              src="/assets/landing.png"
              alt="landing illustration"
              className="rounded-lg shadow-lg max-w-sm"
            />
          </div>
        </div>
      </section>

      {/* Features Section (unchanged) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Understand books in few minutes
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl text-blue-600 flex justify-center mb-4">
                <AiFillFileText />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                Read or listen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Save time by getting the core ideas from the best books.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-yellow-500 flex justify-center mb-4">
                <AiFillBulb />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                Find your next read
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Explore book lists and personalized recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl text-green-600 flex justify-center mb-4">
                <AiFillAudio />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Briefcasts</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gain valuable insights from briefcasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Part 1 */}
      <section className="highlight-section bg-gray-50 dark:bg-gray-900 py-8 md:py-16"
      data-index={0}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-start gap-8 md:gap-12 px-4 md:px-6">
          {/* Highlight List */}
          <div className="flex flex-col justify-center">
            <StatsController length={6} />
            <StatsHighlight
              texts={[
                "Enhance your knowledge",
                "Achieve greater success",
                "Improve your health",
                "Develop better parenting skills",
                "Increase happiness",
                "Be the best version of yourself!",
              ]}
              align="start"
            />
          </div>

          {/* Stats Box */}
          <div className="bg-gray-200 dark:bg-gray-800 p-5 md:p-10 rounded-lg space-y-4 md:space-y-6">
            {[
              {
                percent: "93%",
                desc: (
                  <>
                    of Summarist members{" "}
                    <span className="font-semibold">
                      significantly increase
                    </span>{" "}
                    reading frequency.
                  </>
                ),
              },
              {
                percent: "96%",
                desc: (
                  <>
                    of Summarist members{" "}
                    <span className="font-semibold">establish better</span>{" "}
                    habits.
                  </>
                ),
              },
              {
                percent: "90%",
                desc: (
                  <>
                    have made{" "}
                    <span className="font-semibold">significant positive</span>{" "}
                    change to their lives.
                  </>
                ),
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-start gap-2 md:gap-3">
                <span className="text-lg md:text-xl font-bold text-blue-600">
                  {stat.percent}
                </span>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Part 2 */}
      <section
        className="highlight-section bg-gray-50 dark:bg-gray-900 py-4 md:py-16"
        data-index={1}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-start gap-8 md:gap-12 px-4 md:px-6">
          {/* Stats Box */}
          <div className="order-2 md:order-1 bg-gray-200 dark:bg-gray-800 p-5 md:p-10 rounded-lg space-y-4 md:space-y-6">
            {[
              {
                percent: "91%",
                desc: (
                  <>
                    of Summarist members{" "}
                    <span className="font-semibold">
                      report feeling more productive
                    </span>{" "}
                    after incorporating the service into their daily routine.
                  </>
                ),
              },
              {
                percent: "94%",
                desc: (
                  <>
                    of Summarist members have{" "}
                    <span className="font-semibold">
                      noticed an improvement
                    </span>{" "}
                    in comprehension and retention of information.
                  </>
                ),
              },
              {
                percent: "88%",
                desc: (
                  <>
                    of Summarist members{" "}
                    <span className="font-semibold">feel more informed</span>{" "}
                    about current events and industry trends since using the
                    platform.
                  </>
                ),
              },
            ].map((stat, i) => (
              <div key={i} className="flex items-start gap-2 md:gap-3">
                <span className="text-lg md:text-xl font-bold text-blue-600">
                  {stat.percent}
                </span>
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Highlight List */}
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <StatsHighlight
              texts={[
                "Expand your learning",
                "Accomplish your goals",
                "Strengthen your vitality",
                "Become a better caregiver",
                "Improve your mood",
                "Maximize your abilities",
              ]}
              align="start"
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10">
            What our members say
          </h2>

          <div className="flex flex-col gap-6">
            {[
              {
                name: "Hanna M.",
                review:
                  "This app has been a game-changer for me! It’s saved me so much time and effort in reading and comprehending books. Highly recommend it to all book lovers.",
              },
              {
                name: "David B.",
                review:
                  "I love this app! It provides concise and accurate summaries of books in a way that is easy to understand. It’s also very user-friendly and intuitive.",
              },
              {
                name: "Nathan S.",
                review:
                  "This app is a great way to get the main takeaways from a book without having to read the entire thing. The summaries are well-written and informative. Definitely worth downloading.",
              },
              {
                name: "Ryan R.",
                review:
                  "If you’re a busy person who loves reading but doesn’t have the time to read every book in full, this app is for you! The summaries are thorough and provide a great overview of the book’s content.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-yellow-100/50 dark:bg-gray-800 text-left p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  {item.review}
                </p>
              </div>
            ))}
          </div>

          <button
            className="mt-10 w-full sm:w-64 py-3 bg-green-400 text-black dark:text-white dark:bg-green-600 rounded-md font-semibold hover:bg-green-500 dark:hover:bg-green-700 transition-all"
            onClick={() => setLoginOpen(true)}
          >
            Login
          </button>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="bg-gray-50 dark:bg-gray-900 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
            Start growing with Summarist now
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-blue-600/30 dark:bg-blue-600/20 rounded-lg p-8">
              <div className="text-5xl text-yellow-500 flex justify-center mb-4">
                <BiCrown />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                3 Million
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Downloads on all platforms
              </p>
            </div>
            <div className="bg-blue-600/30 dark:bg-blue-600/20 rounded-lg p-8">
              <div className="text-2xl text-blue-600 flex justify-center mb-4">
                <BsStarFill />
                <BsStarFill />
                <BsStarFill />
                <BsStarFill />
                <BsStarHalf />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                4.5 Stars
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Average ratings on iOS and Google Play
              </p>
            </div>
            <div className="bg-blue-600/30 dark:bg-blue-600/20 rounded-lg p-8">
              <div className="text-5xl text-green-600 flex justify-center mb-4">
                <RiLeafLine />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                97%
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Of Summarist members create a better reading habit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f1f6f4] dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Actions
            </h4>
            <ul className="space-y-2 cursor-not-allowed">
              <li>Summarist Magazine</li>
              <li>Cancel Subscription</li>
              <li>Help</li>
              <li>Contact us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Useful Links
            </h4>
            <ul className="space-y-2 cursor-not-allowed">
              <li>Pricing</li>
              <li>Summarist Business</li>
              <li>Gift Cards</li>
              <li>Authors & Publishers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2 cursor-not-allowed">
              <li>About</li>
              <li>Careers</li>
              <li>Partners</li>
              <li>Code of Conduct</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Other
            </h4>
            <ul className="space-y-2 cursor-not-allowed">
              <li>Sitemap</li>
              <li>Legal Notice</li>
              <li>Terms of Service</li>
              <li>Privacy Policies</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          Copyright &copy; 2025 Logan Heath.
        </div>
      </footer>
    </main>
  );
}
