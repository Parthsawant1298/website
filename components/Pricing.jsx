"use client"

import { useState } from "react"
import { Check, HelpCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("monthly")

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const plans = [
    {
      name: "Starter",
      description: "For small offices with basic needs",
      price: {
        monthly: 4999,
        yearly: 49990,
      },
      features: [
        "Basic stationery package",
        "Monthly delivery",
        "Email support",
        "Access to online catalog",
        "Up to 10 employees",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Business",
      description: "For growing businesses with diverse needs",
      price: {
        monthly: 9999,
        yearly: 99990,
      },
      features: [
        "Complete office supply package",
        "Bi-weekly delivery",
        "Priority email & phone support",
        "Dedicated account manager",
        "Custom ordering portal",
        "Up to 50 employees",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations with complex requirements",
      price: {
        monthly: 19999,
        yearly: 199990,
      },
      features: [
        "Premium office supply package",
        "Weekly delivery",
        "24/7 priority support",
        "Dedicated account team",
        "Custom procurement system",
        "Unlimited employees",
        "Bulk discounts",
        "Customized reporting",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="py-16 bg-gradient-to-b from-white to-teal-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Flexible <span className="text-teal-600">Pricing Plans</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your office supply needs
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly" ? "bg-white text-teal-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "yearly" ? "bg-white text-teal-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly <span className="text-xs text-teal-600 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`bg-white rounded-2xl overflow-hidden border ${
                plan.popular ? "border-teal-300 shadow-xl" : "border-gray-200 shadow-lg"
              } transition-all duration-300 hover:shadow-xl relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{(billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly).toLocaleString()}
                  </span>
                  <span className="text-gray-600">/{billingCycle === "monthly" ? "month" : "year"}</span>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center mb-6 flex items-center justify-center ${
                    plan.popular
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } transition-colors`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

       
             {/* CTA Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-teal-500 to-teal-700 p-10 md:p-16 shadow-xl">
          <div className="md:flex justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-3xl font-bold text-white">Ready to streamline your office supplies?</h3>
              <p className="mt-3 text-lg text-teal-100">Get started today and enjoy 14 days risk-free trial on any plan</p>
            </div>
            <div className="flex flex-wrap gap-5">
              <button className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-teal-700 shadow-sm hover:bg-teal-50 transition-colors">
                Contact Sales
              </button>
              <button className="rounded-xl bg-teal-800 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-teal-900 transition-colors">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
          </div>
        </div>
  )
}
