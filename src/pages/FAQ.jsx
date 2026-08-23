import React from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Truck, RotateCcw, Package, Mail, ChevronDown } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    questions: [
      { q: 'How long does delivery take?', a: 'Orders are dispatched within 1–2 business days. Standard delivery takes 3–5 business days across India. Metro cities typically receive orders in 2–3 days.' },
      { q: 'Do you offer free shipping?', a: 'Yes! All orders above ₹1,500 qualify for free shipping anywhere in India. Orders below that amount carry a flat ₹99 shipping fee.' },
      { q: 'Which courier services do you use?', a: 'We partner with trusted carriers like Delhivery, BlueDart, and India Post to ensure your toys arrive safely and on time. You\'ll receive a tracking link via email once your order ships.' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We\'re working on expanding internationally — sign up for our newsletter to be the first to know when we do!' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order is shipped, you\'ll receive an email with a tracking number and link. You can also reach out to us anytime for an update.' },
    ],
  },
  {
    icon: RotateCcw,
    title: 'Returns & Exchanges',
    questions: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return window from the date of delivery. If a toy doesn\'t meet your expectations, you can return it in its original, unused condition for a full refund.' },
      { q: 'How do I initiate a return?', a: 'Simply email us at hello@funfable.store with your order number and the reason for the return. We\'ll guide you through the process and arrange a pickup where possible.' },
      { q: 'Who pays for return shipping?', a: 'If the item is damaged or defective, we cover the return shipping. For change-of-mind returns, the customer bears the return shipping cost.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 3–5 business days of us receiving the returned item. The amount will be credited to your original payment method.' },
      { q: 'Can I exchange a toy?', a: 'Yes, exchanges are available for size or variant differences. Contact us within 7 days of delivery and we\'ll help you swap it for the right fit.' },
    ],
  },
  {
    icon: Package,
    title: 'Products & Play',
    questions: [
      { q: 'How do you choose which toys to carry?', a: 'Every toy is hand-selected based on safety, durability, educational value, and play potential. We test each product and only stock what we\'d give to our own children.' },
      { q: 'Are the toys safe for all age groups?', a: 'Each product page clearly lists the recommended age range. We follow strict safety standards and ensure all materials are non-toxic and age-appropriate. Always check the age guidance before purchasing.' },
      { q: 'Are your toys eco-friendly?', a: 'We prioritise toys made from sustainable materials like solid wood, organic cotton, and non-toxic finishes. Many of our brands use FSC-certified wood and water-based paints.' },
      { q: 'Do you gift wrap?', a: 'Yes! We offer beautiful gift wrapping for a small fee. Just select the gift wrap option at checkout and add a personal note if you\'d like.' },
      { q: 'Can I include a gift message?', a: 'Of course. During checkout, you\'ll see an option to add a gift note that we\'ll handwrite and include with the package.' },
    ],
  },
  {
    icon: Mail,
    title: 'Store & Orders',
    questions: [
      { q: 'How do I place an order?', a: 'Browse our shop, add your favourites to the cart, and head to checkout. Fill in your shipping details and confirm — it\'s that simple!' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and popular wallets. All payments are processed through secure payment gateways.' },
      { q: 'Can I modify or cancel my order?', a: 'If your order hasn\'t been shipped yet, we can usually modify or cancel it. Contact us immediately at hello@funfable.store and we\'ll do our best to help.' },
      { q: 'Do you offer bulk or school orders?', a: 'Yes, we offer special pricing for schools, play schools, and bulk orders. Reach out via our contact page and we\'ll put together a custom quote.' },
      { q: 'How can I contact customer support?', a: 'You can email us at hello@funfable.store or use our contact page. We typically respond within 24 hours, Monday through Saturday.' },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block bg-sage-soft text-forest text-xs font-semibold tracking-wider uppercase px-4 py-1.5 squircle-sm mb-6">Help Centre</span>
        <h1 className="font-display text-5xl font-medium text-forest mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to know about shipping, returns, and our toys. Can't find what you're looking for?{' '}
          <Link to="/contact" className="text-forest underline underline-offset-4">Get in touch</Link>.
        </p>
      </div>

      {/* FAQ sections */}
      <div className="space-y-12">
        {FAQ_SECTIONS.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 squircle-sm bg-forest text-paper flex items-center justify-center">
                <section.icon className="w-4 h-4" />
              </div>
              <h2 className="font-display text-2xl font-medium text-forest">{section.title}</h2>
            </div>
            <Accordion type="single" collapsible className="bg-card squircle-lg border border-border">
              {section.questions.map((item, qIdx) => {
                const value = `${sIdx}-${qIdx}`;
                return (
                  <AccordionItem key={qIdx} value={value} className={`px-6 ${qIdx === 0 ? '' : 'border-t border-border'}`}>
                    <AccordionTrigger className="text-left text-forest font-medium hover:no-underline py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-20 bg-forest squircle-lg p-12 text-center text-paper grain">
        <h2 className="font-display text-3xl font-medium mb-3">Still have questions?</h2>
        <p className="text-paper/70 mb-6">Our team is here to help. We typically respond within 24 hours.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 bg-terracotta text-white squircle-sm h-12 px-7 font-medium hover:opacity-90 transition">
          Contact us
        </Link>
      </div>
    </div>
  );
}