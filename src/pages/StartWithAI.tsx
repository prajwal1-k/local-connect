import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AiChatbot from "@/components/AiChatbot";

export default function StartWithAI() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-foreground md:text-5xl"
          >
            Start with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Launch your business growth with AI automation, insights and customer engagement tools. Get started in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl shadow-primary/20"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI-Powered Growth</h2>
                <p className="text-sm text-muted-foreground">Smart automation and data-driven insights for your business.</p>
              </div>
            </div>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <p>• Providers can add new services with AI-generated title, description, and pricing guidance using prompt templates.</p>
              <p>• AI helps set service categories, location coverage, and scheduling rules automatically.</p>
              <p>• Customers get AI-assisted recommendations, match percentage, and step-by-step booking guidance.</p>
            </div>
            <div className="mb-4 rounded-xl bg-muted/10 p-4 text-sm">
              <p className="font-semibold text-foreground">Try these AI prompts:</p>
              <ul className="ml-4 list-disc text-muted-foreground">
                <li>“Create a plumber service listing for leak repair within 24h in Bangalore at competitive pricing.”</li>
                <li>“Suggest a 3-step communication flow to convert a first-time home cleaning lead.”</li>
                <li>“Recommend service package upsells for a customer interested in AC maintenance.”</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button size="lg" className="gradient-primary border-0 text-primary-foreground" asChild>
                <Link to="/signup?role=provider">
                  Join as Provider <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 text-primary" asChild>
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-accent/15 bg-gradient-to-br from-primary/5 to-accent/10 p-8 shadow-2xl shadow-accent/20"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">Ask AI anything about your next steps and getting started.</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Use the chat tool to get instant AI recommendations for:
            </p>
            <ul className="mb-4 ml-4 list-disc text-sm text-muted-foreground">
              <li>Create a new service listing with optimized title/description/pricing.</li>
              <li>Recommend top local services based on customer needs and history.</li>
              <li>Generate pre-booking suggestions and messaging templates.</li>
            </ul>
            <div className="mb-4 rounded-xl bg-muted/10 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Suggested chart prompts</p>
              <ul className="ml-4 list-disc">
                <li>“How should I define a premium home cleaning package for quick booking?”</li>
                <li>“Suggest 5 high-converting landing phrases for a salon service in my area.”</li>
                <li>“Customer needs weekend plumbing support; what follow-up steps should I send?”</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/90 p-4">
              <AiChatbot />
            </div>
          </motion.div>
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-border/40 bg-white/70 p-8 shadow-lg sm:grid-cols-2">
          {[
            { title: "Onboard in minutes", desc: "Simple forms and AI suggestions help you setup quickly." },
            { title: "Data that works", desc: "AI insights deliver smarter decisions from day one." },
            { title: "Customer engagement", desc: "Auto chat sequences to convert users faster." },
            { title: "Track performance", desc: "Monitor leads, appointments, and revenue in one dashboard." },
          ].map((item) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl border border-border/70 p-4">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
