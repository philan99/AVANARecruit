import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, ShieldCheck, FileText, BarChart3 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
  platform: z.string().min(1, "Please select a platform"),
  message: z.string().optional()
});

export function ContactSection() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      platform: "",
      message: ""
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast.success("Thanks — we'll be in touch.");
    form.reset();
  };

  const products = [
    { name: "AVANA Recruit", status: "Live", desc: "AI-Powered Talent Matching", icon: Users },
    { name: "AVANA Onboard", status: "Coming Soon", desc: "AI-Powered Employee Onboarding", icon: ShieldCheck },
    { name: "AVANA Docs", status: "Coming Soon", desc: "AI Document & Knowledge Assistant", icon: FileText },
    { name: "AVANA Insights", status: "Live", desc: "AI Data Consolidation Platform", icon: BarChart3 },
  ];

  return (
    <section id="contact" className="py-24 bg-[#1a2035] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Column */}
          <div>
            <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-6 text-white">
              Ready to elevate your operations?
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-12">
              Whether you want to deploy AVANA Recruit today or discuss custom enterprise AI integration, our team is ready.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p.icon size={20} className="text-[#4CAF50]" />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${p.status === 'Live' ? 'bg-[#4CAF50]/20 text-[#4CAF50]' : 'bg-white/10 text-white/60'}`}>
                      {p.status}
                    </span>
                  </div>
                  <h4 className="text-white font-bold mb-1">{p.name}</h4>
                  <p className="text-white/50 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@company.com" type="email" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform of Interest</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVANA Recruit">AVANA Recruit</SelectItem>
                          <SelectItem value="AVANA Onboard">AVANA Onboard</SelectItem>
                          <SelectItem value="AVANA Docs">AVANA Docs</SelectItem>
                          <SelectItem value="AVANA Insights">AVANA Insights</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How can we help?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your operational challenges..." 
                          className="resize-none min-h-[100px] bg-white" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#F5F0B0] text-[#1A2035] hover:bg-[#e6e1a1] font-semibold py-6 text-base rounded-md border-none no-default-hover-elevate shadow-sm"
                >
                  Request Contact
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By submitting, you agree to our privacy policy.
                </p>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </section>
  );
}
