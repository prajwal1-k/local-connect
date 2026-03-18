
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Target,
  Award,
  Heart,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community First",
    desc: "We believe in building strong local communities by connecting people with trusted service providers in their area.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Quality Assurance",
    desc: "Every service provider on our platform undergoes rigorous verification to ensure they meet our high standards.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Excellence",
    desc: "We strive for excellence in every interaction, from booking to service delivery and customer support.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Customer Satisfaction",
    desc: "Your satisfaction is our top priority. We work tirelessly to ensure every experience exceeds expectations.",
    color: "from-red-500 to-orange-500"
  }
];

const stats = [
  { number: "15,000+", label: "Happy Customers", icon: <Users className="h-6 w-6" />, color: "text-blue-500" },
  { number: "3,200+", label: "Verified Providers", icon: <Shield className="h-6 w-6" />, color: "text-green-500" },
  { number: "75+", label: "Service Categories", icon: <Globe className="h-6 w-6" />, color: "text-purple-500" },
  { number: "4.9/5", label: "Average Rating", icon: <Star className="h-6 w-6" />, color: "text-yellow-500" }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">

      {/* Back to Home */}
      <div className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              About KodeQuantum
            </span>

            <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              About <span>KodeQuantum</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              We're revolutionizing local services by connecting customers with verified professionals through technology and trust.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" className="gradient-primary border-0" asChild>
                <Link to="/services">
                  Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link to="/signup?role=provider">Join as Provider</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Our Story</h2>

              <p className="text-muted-foreground text-lg leading-relaxed">
                Founded in 2026, KodeQuantum was born from a simple idea: local services should be as easy to access as online shopping.
                We noticed that finding trustworthy local professionals was often frustrating and time-consuming.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-8">

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
                      <TrendingUp className="h-6 w-6" />
                    </div>

                    <h3 className="mb-4 text-xl font-bold">The Problem</h3>

                    <p className="text-muted-foreground leading-relaxed">
                      Customers struggled to find reliable service providers, while professionals had difficulty reaching customers.
                      The traditional methods of finding local services were outdated and inefficient.
                    </p>

                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-8">

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>

                    <h3 className="mb-4 text-xl font-bold">Our Solution</h3>

                    <p className="text-muted-foreground leading-relaxed">
                      We created a platform that verifies professionals, provides transparent pricing, and makes booking services
                      as simple as a few clicks. Our technology ensures quality and builds trust.
                    </p>

                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Our Values</h2>
            <p className="text-muted-foreground">The principles that guide everything we do</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >

                <Card className="h-full border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">

                  <CardContent className="flex flex-col items-center text-center p-6">

                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${value.color} text-white`}>
                      {value.icon}
                    </div>

                    <h3 className="mb-2 font-semibold text-lg">{value.title}</h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.desc}
                    </p>

                  </CardContent>

                </Card>

              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24">

        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">By the Numbers</h2>
            <p className="text-muted-foreground">Our growing community and impact</p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">

            {stats.map((stat) => (

              <Card key={stat.label} className="border-0 shadow-card">

                <CardContent className="p-6 text-center">

                  <div className="mb-3 flex justify-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>

                  <div className="text-2xl font-bold">
                    {stat.number}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>

                </CardContent>

              </Card>

            ))}

          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="py-10">

        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">K</span>
            </div>

            <span className="font-semibold text-foreground">
              KodeQuantum Local Services
            </span>
          </div>

          <p>© 2026 KodeQuantum. All rights reserved.</p>

        </div>

      </footer>

    </div>
  );
}
