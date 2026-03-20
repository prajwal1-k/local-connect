import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Reach More Customers",
    desc: "Get discovered by thousands of local customers actively searching for your services.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Bookings",
    desc: "Receive service requests directly — no middleman, no delays.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Track Performance",
    desc: "Monitor your ratings, reviews, and booking trends from your dashboard.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Scale Your Business",
    desc: "From solo professional to a full team — grow at your own pace.",
  },
];

export default function GrowSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              For Professionals
            </span>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Grow Using KodeQuantum
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Join our platform and turn your skills into a thriving business
            </p>
          </motion.div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-start gap-4 rounded-xl bg-background p-6 shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {b.icon}
              </div>
              <div>
                <h3 className="mb-1 font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 text-center"
        >
          <Button size="lg" className="gradient-primary border-0" asChild>
            <Link to="/signup?role=provider">
              Join as a Provider <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
