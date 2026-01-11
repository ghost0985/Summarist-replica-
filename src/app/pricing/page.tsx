"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RiPlantFill } from "react-icons/ri";
import { FaHandshake, FaFileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function PricingPage() {
  const router = useRouter();
  const { uid, email, displayName } = useAppSelector((state) => state.user);

  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">(
    "yearly"
  );
  const [openFAQ, setOpenFAQ] = useState<string | null>("trial");
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const [isSticky, setIsSticky] = useState(true);

  // === Sticky Upgrade Button
  useEffect(() => {
    footerRef.current = document.querySelector("footer");
    if (!footerRef.current || !stickyRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  // === Handle Plan Upgrade ===
  const handleUpgrade = async (plan: "yearly" | "monthly") => {
    const theme = localStorage.getItem("theme") || "light";
    if (!uid) {
      toast.error("You must be logged in to upgrade.");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          theme,
          uid,
          userEmail: email,
          displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* === Hero Section === */}
      <section className="hero relative bg-[#052c3b] dark:bg-[#041f2b] text-white overflow-hidden pb-20 sm:pb-32 md:pb-40 rounded-b-[150px] sm:rounded-b-[200px] md:rounded-b-[255px]">
        <div className="max-w-5xl mx-auto text-center pt-10 sm:pt-12 pb-32 sm:pb-40 relative z-10 px-4">
          <h1 className="text-2xl sm:text-4xl md:text-[45px] font-semibold leading-snug sm:leading-tight mb-4 sm:mb-10">
            Get unlimited access to many amazing books to read
          </h1>
          <p className="text-base sm:text-xl text-gray-200 max-w-md mx-auto">
            Turn ordinary moments into amazing learning opportunities
          </p>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 z-20">
          <div className="bg-white dark:bg-[#0d1117] rounded-t-[140px] sm:rounded-t-[180px] md:rounded-t-[200px] overflow-hidden w-[160px] sm:w-[250px] md:w-[350px] shadow-lg flex justify-center">
            <Image
              src="/assets/pricing-top.png"
              alt="Upgrade illustration"
              width={350}
              height={280}
              className="object-contain w-[200px] sm:w-[280px] md:w-[400px] h-auto mx-auto"
            />
          </div>
        </div>
      </section>

      {/* === Features Section === */}
      <section className="relative bg-gray-50 dark:bg-[#0d1117] px-4 sm:px-8 py-8 sm:py-12 text-center flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-3xl gap-10 mx-auto mt-6 sm:mt-12">
          {[
            {
              icon: (
                <FaFileAlt
                  size={45}
                  className="sm:size-[55px] mx-auto text-[#052c3b] dark:text-green-400 mb-4"
                />
              ),
              title: "Key ideas in few min ",
              subtitle: "with many books to read",
            },
            {
              icon: (
                <RiPlantFill
                  size={45}
                  className="sm:size-[55px] mx-auto text-[#052c3b] dark:text-green-400 mb-4"
                />
              ),
              title: "3 million ",
              subtitle: "people growing with Summarist everyday",
            },
            {
              icon: (
                <FaHandshake
                  size={45}
                  className="sm:size-[55px] mx-auto text-[#052c3b] dark:text-green-400 mb-4"
                />
              ),
              title: "Precise recommendations ",
              subtitle: "collections curated by experts",
            },
          ].map((item, index) => (
            <div key={index}>
              {item.icon}
              <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                {item.title}
                <span className="font-normal text-gray-600 dark:text-gray-400 block sm:inline">
                  {item.subtitle}
                </span>
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-12 sm:mt-16">
          Choose the plan that fits you
        </h2>

        {/* === Plans Section === */}
        <div className="max-w-2xl mx-auto text-center mt-6 sm:mt-8 mb-2 px-3">
          <div className="space-y-8 sm:space-y-10">
            {[
              {
                id: "yearly",
                title: "Premium Plus Yearly",
                price: "$99.99/year",
                desc: "7-day free trial included",
              },
              {
                id: "monthly",
                title: "Premium Monthly",
                price: "$9.99/month",
                desc: "No trial included",
              },
            ].map(({ id, title, price, desc }, i) => (
              <div
                key={id}
                onClick={() => setSelectedPlan(id as "yearly" | "monthly")}
                className={`cursor-pointer border-[2.5px] sm:border-[3px] p-4 sm:p-5 text-left rounded-lg transition-all ${
                  selectedPlan === id
                    ? "border-green-500 bg-gray-100 dark:bg-gray-800"
                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      selectedPlan === id
                        ? "border-[#00B846]"
                        : "border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {selectedPlan === id && (
                      <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-semibold mb-1 sm:mb-2">
                      {title}
                    </h3>
                    <p className="font-bold text-[20px] sm:text-[22px] leading-tight">
                      {price}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[14px] sm:text-[15px] mt-1">
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Sticky Upgrade Button === */}
      <div
        ref={stickyRef}
        className={`text-center py-4 sm:py-6 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-[#0d1117] transition-all duration-200 ${
          isSticky ? "sticky bottom-0" : "relative"
        }`}
      >
        <button
          onClick={() => handleUpgrade(selectedPlan)}
          className="bg-[#00B846] hover:bg-[#00A13D] text-white font-medium py-3 px-6 sm:px-8 rounded-md w-[90%] sm:w-auto transition"
        >
          {selectedPlan === "monthly"
            ? "Start your first month"
            : "Start your free 7-day trial"}
        </button>
        <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-[13px] mt-2 px-3">
          {selectedPlan === "monthly"
            ? "30-day money back guarantee, no questions asked."
            : "Cancel anytime before the trial ends and you won't be charged."}
        </p>
      </div>

      {/* === FAQ Section === */}
      <section className="bg-gray-50 dark:bg-gray-900 mb-6 sm:mb-10 px-4">
        <div className="max-w-4xl w-full mx-auto">
          {[
            {
              id: "trial",
              question: "How does the free 7-day trial work?",
              answer:
                "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
            },
            {
              id: "switch",
              question:
                "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
              answer:
                "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
            },
            {
              id: "included",
              question: "What's included in the Premium plan?",
              answer:
                "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
            },
            {
              id: "cancel",
              question: "Can I cancel during my trial or subscription?",
              answer:
                "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.",
            },
          ].map(({ id, question, answer }) => (
            <div
              key={id}
              className="border-b border-gray-300 dark:border-gray-700 py-3 sm:py-4"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === id ? null : id)}
                className="flex justify-between w-full text-left font-bold text-[18px] sm:text-[24px] pt-3 sm:pt-5"
              >
                {question}
                {openFAQ === id ? <ChevronUp /> : <ChevronDown />}
              </button>
              <div
                className={`faq-answer ${
                  openFAQ === id ? "open" : ""
                } text-gray-600 dark:text-gray-400 pt-3 sm:pt-5 text-[15px] sm:text-[16px] leading-relaxed`}
              >
                {answer}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === Footer === */}
      <footer className="w-full bg-[#f1f6f4] dark:bg-gray-800 text-[#032b41] dark:text-gray-300 py-16 transition-colors duration-300">
        <div className="max-w-[1500px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-20 md:gap-x-24 lg:gap-x-28">
          {[
            {
              title: "Actions",
              links: [
                "Summarist Magazine",
                "Cancel Subscription",
                "Help",
                "Contact us",
              ],
            },
            {
              title: "Useful Links",
              links: [
                "Pricing",
                "Summarist Business",
                "Gift Cards",
                "Authors & Publishers",
              ],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Partners", "Code of Conduct"],
            },
            {
              title: "Other",
              links: [
                "Sitemap",
                "Legal Notice",
                "Terms of Service",
                "Privacy Policies",
              ],
            },
          ].map(({ title, links }, i) => (
            <div key={i}>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                {title}
              </h4>
              <ul className="space-y-1.5 text-[15px] leading-relaxed text-gray-700 dark:text-gray-400">
                {links.map((link, j) => (
                  <li key={j}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm text-[#032b41]/80 dark:text-gray-400">
            © 2025 Logan Heath. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
