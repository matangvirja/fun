import { db } from '@/api/supabaseClient';
import React, { useState } from 'react';

import { Mail, MapPin, Clock, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email us', value: 'hello@funfable.store', href: 'mailto:hello@funfable.store' },
  { icon: MapPin, label: 'Visit us', value: 'Bengaluru, India' },
  { icon: Clock, label: 'Response time', value: 'Within 24 hours, Mon–Sat' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await db.functions.invoke('sendContactInquiry', form);
      setSent(true);
    } catch (err) {
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <PageTitle title="Contact Us" />
      {/* Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block bg-sage-soft text-forest text-xs font-semibold tracking-wider uppercase px-4 py-1.5 squircle-sm mb-6">Get in Touch</span>
        <h1 className="font-display text-5xl font-medium text-forest mb-4">We'd love to hear from you</h1>
        <p className="text-muted-foreground text-lg">
          Questions about a toy, an order, or just want to say hello? Drop us a message and we'll get back to you within 24 hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-4">
          {CONTACT_INFO.map((item, i) => (
            <div key={i} className="bg-card squircle-lg border border-border p-6 flex items-start gap-4">
              <div className="w-11 h-11 squircle-sm bg-forest text-paper flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-forest font-medium hover:underline">{item.value}</a>
                ) : (
                  <p className="text-forest font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}
          <div className="bg-forest squircle-lg border border-border p-6 text-paper grain">
            <MessageCircle className="w-6 h-6 mb-3 text-terracotta" />
            <h3 className="font-display text-xl mb-2">Need a quick answer?</h3>
            <p className="text-paper/70 text-sm mb-4">Check our FAQ page for instant answers to shipping, returns, and product questions.</p>
            <a href="/faq" className="text-terracotta font-medium text-sm hover:underline">Browse FAQ →</a>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-card squircle-lg border border-border p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 squircle-sm bg-sage-soft flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-forest" />
                </div>
                <h2 className="font-display text-3xl text-forest mb-3">Message sent!</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Thank you for reaching out. We've received your message and will respond within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="text-forest font-medium hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Your name" value={form.name} onChange={v => set('name', v)} required />
                  <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} required />
                </div>
                <Field label="Subject" value={form.subject} onChange={v => set('subject', v)} required />
                <label className="block">
                  <span className="text-sm text-muted-foreground mb-1.5 block">Message</span>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={6} className="w-full px-4 py-3 squircle-sm bg-paper border border-border outline-none focus:border-forest resize-none" placeholder="Tell us how we can help…" />
                </label>
                <button disabled={loading} className="w-full h-14 bg-forest text-paper squircle font-medium hover:bg-forest/90 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  <Send className="w-4 h-4" /> {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full h-12 px-4 squircle-sm bg-paper border border-border outline-none focus:border-forest" />
    </label>
  );
}
