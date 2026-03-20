import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle, Send } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to send message");

      toast({
        title: "Message sent",
        description: data?.message || "Thanks for contacting us. We'll get back to you shortly.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error sending message";
      toast({ title: "Unable to send message", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-primary opacity-[0.02]" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/35 via-accent/25 to-transparent blur-3xl"
      />
      <div aria-hidden className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-3xl" />

      <div className="container mx-auto relative z-10 px-4">
        <div className="pt-6 pb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground -ml-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>

        <section className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <MessageCircle className="h-4 w-4" />
              Contact LocalConnect
            </span>
            <h1 className="mx-auto mb-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              We are here to help
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Send us a message and our support team will get back to you as soon as possible.
            </p>
          </motion.div>
        </section>

        <section>
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <Card className="border-0 shadow-elevated">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>Tell us what you need, and we'll route it to the right team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Write your message..."
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gradient-primary border-0" disabled={loading}>
                      {loading ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-xs text-muted-foreground">By submitting, you agree to be contacted about your request.</p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                <Card className="border-0 bg-card/70 shadow-card backdrop-blur">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Get in Touch</CardTitle>
                    <CardDescription>Prefer something else? Reach us here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border/60 bg-background/40 p-4 transition hover:bg-accent/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Email</p>
                          <p className="mt-1 text-sm text-muted-foreground">kodequantum@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/40 p-4 transition hover:bg-accent/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Address</p>
                          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                            LocalConnect
                            {"\n"}
                            Bengaluru, Karnataka, India
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/40 p-4 transition hover:bg-accent/5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Working hours</p>
                          <p className="mt-1 text-sm text-muted-foreground">Mon - Sat: 10:00 AM - 7:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-6 backdrop-blur">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Typical response time</p>
                      <p className="mt-1 text-sm text-muted-foreground">Within 24 hours on weekdays.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <footer className="py-12">
          <div className="rounded-2xl border border-border/60 bg-background/40 px-5 py-6 text-center backdrop-blur">
            <p className="text-sm text-muted-foreground">© 2026 LocalConnect. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}