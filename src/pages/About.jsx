import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/lib/useSiteData';
import { Image } from '@/components/ui/image';
import { Heart, Sparkles, Shield, Leaf, ArrowRight } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

const VALUES = [
  { icon: Heart, title: 'Play with Purpose', body: 'Every toy in our collection is chosen for its ability to nurture, not just entertain. We look for toys that spark curiosity, build confidence, and grow with your child.' },
  { icon: Leaf, title: 'Safe & Sustainable', body: 'We prioritise natural materials — wood, organic cotton, non-toxic finishes. Toys that are gentle on little hands and gentle on the planet they\'ll inherit.' },
  { icon: Sparkles, title: 'Open-Ended Play', body: 'No flashing lights or one-button wonders. We curate toys that invite imagination, storytelling, and endless ways to play — the way childhood was meant to be.' },
  { icon: Shield, title: 'Built to Last', body: 'These aren\'t toys that break by January. They\'re heirloom-quality pieces designed to be loved, passed down, and rediscovered by the next little explorer.' },
];

export default function About() {
  const { data: settings } = useSiteSettings();

  return (
    <div>
      <PageTitle title="Our Story" />
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="max-w-3xl">
          <span className="inline-block bg-sage-soft text-forest text-xs font-semibold tracking-wider uppercase px-4 py-1.5 squircle-sm mb-6">Our Story</span>
          <h1 className="font-display text-5xl sm:text-6xl font-medium text-forest leading-[1.1] text-balance mb-6">
            We believe every toy should tell a story.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            FunFable was born from a simple frustration: the toy aisle had become loud, plastic, and disposable. We wanted something different for our children — toys with soul, with purpose, with the power to become part of their story.
          </p>
        </div>
      </section>

      {/* Mission image */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mb-20">
        <div className="relative h-[320px] sm:h-[440px] squircle-lg overflow-hidden bg-secondary">
          <Image src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&q=80" alt="Children playing with wooden toys" fittingType="fill" className="w-full h-full" />
        </div>
      </section>

      {/* Mission text */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 mb-24">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 sm:h-80 squircle-lg overflow-hidden bg-sage-soft">
            <Image src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80" alt="Wooden toys" fittingType="fill" className="w-full h-full" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium text-forest mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To curate a world of toys that respect how children actually play — slowly, creatively, and with boundless imagination. We search for pieces that are beautiful enough to leave on the shelf and durable enough to survive the wildest adventures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every toy we stock has been played with, tested, and approved. If it doesn't make us smile, it doesn't make the cut.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display text-4xl font-medium text-forest text-center mb-4">What we stand for</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto">Four principles that guide every toy we choose to carry.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-paper squircle-lg p-7 border border-border">
                <div className="w-12 h-12 squircle-sm bg-forest text-paper flex items-center justify-center mb-5">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl text-forest mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story from settings */}
      {(settings?.story_title || settings?.story_body) && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl font-medium text-forest mb-6">{settings.story_title || 'The FunFable Story'}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{settings.story_body}</p>
            </div>
            {settings.story_image && (
              <div className="relative h-80 squircle-lg overflow-hidden bg-secondary">
                <Image src={settings.story_image} alt="Our story" fittingType="fill" className="w-full h-full" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="bg-forest squircle-lg p-12 sm:p-16 text-center text-paper grain">
          <h2 className="font-display text-4xl font-medium mb-4">Ready to find their next favourite?</h2>
          <p className="text-paper/70 mb-8 max-w-xl mx-auto">Explore our thoughtfully curated collection of toys for ages 0–12.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-terracotta text-white squircle-sm h-14 px-8 font-medium hover:opacity-90 transition">
            Shop the collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}