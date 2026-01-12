"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, X, Bell, AlertCircle } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

type SubscriptionMethod = "email" | "sms";

interface SubscriptionAvailability {
  email: boolean;
  sms: boolean;
}

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

const smsSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { message: "Phone number is required" })
    .regex(/^\+?[1-9]\d{6,14}$/, {
      message: "Please enter a valid phone number (e.g., +1234567890)",
    }),
});

interface SubscribeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscribeDialog({ isOpen, onClose }: SubscribeDialogProps) {
  const [method, setMethod] = useState<SubscriptionMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<SubscriptionAvailability | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch subscription availability when dialog opens
  useEffect(() => {
    if (isOpen && availability === null) {
      setIsLoadingAvailability(true);
      fetch("/api/subscribe")
        .then((res) => res.json())
        .then((data: SubscriptionAvailability) => {
          setAvailability(data);
          // Auto-select first available method
          if (data.email) {
            setMethod("email");
          } else if (data.sms) {
            setMethod("sms");
          }
        })
        .catch(() => {
          // If fetch fails, assume nothing is available
          setAvailability({ email: false, sms: false });
        })
        .finally(() => {
          setIsLoadingAvailability(false);
        });
    }
  }, [isOpen, availability]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (method === "email") {
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
          setErrors({ email: result.error.errors[0].message });
          setIsSubmitting(false);
          return;
        }
        
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "email", email }),
        });
        
        if (!response.ok) {
          let errorMessage = "Failed to subscribe";
          try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } catch {
            errorMessage = response.statusText || `Error ${response.status}`;
          }
          throw new Error(errorMessage);
        }
        
        setSuccessMessage(`You'll receive status updates at ${email}`);
        setEmail("");
      } else {
        const result = smsSchema.safeParse({ phone });
        if (!result.success) {
          setErrors({ phone: result.error.errors[0].message });
          setIsSubmitting(false);
          return;
        }
        
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "sms", phone }),
        });
        
        if (!response.ok) {
          let errorMessage = "Failed to subscribe";
          try {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } catch {
            errorMessage = response.statusText || `Error ${response.status}`;
          }
          throw new Error(errorMessage);
        }
        
        setSuccessMessage(`You'll receive SMS updates at ${phone}`);
        setPhone("");
      }
      
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to subscribe. Please try again.";
      setErrors({ 
        [method === "email" ? "email" : "phone"]: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const neitherAvailable = availability && !availability.email && !availability.sms;
  const onlyEmailAvailable = availability?.email && !availability?.sms;
  const onlySmsAvailable = !availability?.email && availability?.sms;
  const bothAvailable = availability?.email && availability?.sms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-lg animate-fade-in rounded-xl border border-border bg-card shadow-2xl sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-foreground">Get status updates</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoadingAvailability ? (
          <div className="flex items-center justify-center p-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        ) : neitherAvailable ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Subscriptions not available
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Status update notifications are not currently configured. Please check back later or contact the administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row">
            {/* Tabs - horizontal on mobile, vertical sidebar on desktop */}
            {bothAvailable && (
              <>
                {/* Mobile: horizontal tabs */}
                <div className="flex gap-2 border-b border-border p-3 sm:hidden">
                  <button
                    onClick={() => {
                      setMethod("email");
                      setErrors({});
                      setSuccessMessage(null);
                    }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      method === "email"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setMethod("sms");
                      setErrors({});
                      setSuccessMessage(null);
                    }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      method === "sms"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </button>
                </div>
                {/* Desktop: vertical sidebar */}
                <div className="hidden w-40 flex-shrink-0 flex-col gap-1 border-r border-border bg-muted/30 p-3 sm:flex">
                  <button
                    onClick={() => {
                      setMethod("email");
                      setErrors({});
                      setSuccessMessage(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                      method === "email"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => {
                      setMethod("sms");
                      setErrors({});
                      setSuccessMessage(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                      method === "sms"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </button>
                </div>
              </>
            )}

            {/* Form area */}
            <form onSubmit={handleSubmit} className="flex-1 p-5 sm:p-6">
              {successMessage ? (
                <div className="flex items-center gap-3 rounded-lg bg-status-operational/10 p-4 text-status-operational">
                  <Bell className="h-5 w-5" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              ) : (availability?.email && method === "email") || onlyEmailAvailable ? (
                <div className="space-y-4">
                  {onlyEmailAvailable && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-4 w-4" />
                      <span>Subscribe via email</span>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={cn(
                        "w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground",
                        "placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "transition-all",
                        errors.email ? "border-destructive" : "border-input"
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll only email you when there are incidents or scheduled maintenance.
                  </p>
                </div>
              ) : (availability?.sms && method === "sms") || onlySmsAvailable ? (
                <div className="space-y-4">
                  {onlySmsAvailable && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Subscribe via SMS</span>
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className={cn(
                        "w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground",
                        "placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "transition-all",
                        errors.phone ? "border-destructive" : "border-input"
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include your country code. Standard SMS rates may apply.
                  </p>
                </div>
              ) : null}

              {!successMessage && !neitherAvailable && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5",
                      "text-sm font-medium text-primary-foreground transition-all",
                      "hover:bg-primary/90",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

interface SubscribeButtonProps {
  onClick: () => void;
}

export function SubscribeButton({ onClick }: SubscribeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card",
        "h-9 w-9 sm:h-auto sm:w-auto sm:px-4 sm:py-2",
        "text-sm font-medium text-foreground transition-all",
        "hover:bg-accent hover:text-accent-foreground"
      )}
      aria-label="Subscribe to updates"
    >
      <Bell className="h-4 w-4" />
      <span className="hidden sm:inline">Subscribe</span>
    </button>
  );
}

// Self-contained subscribe component with button and dialog
export function Subscribe() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <SubscribeButton onClick={() => setIsOpen(true)} />
      <SubscribeDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
