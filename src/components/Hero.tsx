import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import profileData from "@/data/profile.json";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nameParts = profileData.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-32 sm:pt-36 md:pt-40 lg:pt-32 pb-12 px-6 relative overflow-hidden">
      {/* Grid pattern background - More visible */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1.1px, transparent 1.5px), linear-gradient(90deg, hsl(var(--primary)) 1.5px, transparent 1.5px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-center min-h-[70vh]">
          {/* Left side - Main content */}
          <div className="space-y-6 md:space-y-8 animate-fade-in lg:pr-16 lg:max-w-2xl">

            <div className="space-y-3 md:space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                <span className="block text-foreground">{firstName}</span>
                <span className="block bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">{lastName}</span>
              </h1>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {profileData.roles.map((role) => (
                  <span key={role} className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              {profileData.bio}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                onClick={() => scrollToSection("projects")}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group shadow-lg shadow-primary/20 text-sm md:text-base"
              >
                View Projects
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary/50 backdrop-blur-sm text-sm md:text-base"
              >
                Get in Touch
              </Button>
            </div>
          </div>

          {/* Right side - Torn Glass Effect with Photo */}
          <div className="relative lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-[45vw] animate-fade-in-slow z-0 hidden lg:block">
            <div className="relative h-full min-h-[600px]">
              {/* Magenta glow splash on the jagged edge */}
              <div className="absolute left-0 top-0 h-full w-40 opacity-50 z-10">
                <div className="absolute -left-2 top-[5%] w-16 h-32 bg-[#FF1493] rounded-full blur-[60px] animate-pulse" />
                <div className="absolute left-1 top-[15%] w-12 h-24 bg-[#FF1493] rounded-full blur-[50px] animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute -left-1 top-[28%] w-18 h-28 bg-[#FF1493] rounded-full blur-[55px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute left-2 top-[42%] w-14 h-26 bg-[#FF1493] rounded-full blur-[45px] animate-pulse" style={{ animationDelay: "1.5s" }} />
                <div className="absolute -left-2 top-[56%] w-20 h-30 bg-[#FF1493] rounded-full blur-[65px] animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="absolute left-1 top-[71%] w-16 h-28 bg-[#FF1493] rounded-full blur-[50px] animate-pulse" style={{ animationDelay: "0.8s" }} />
                <div className="absolute -left-1 top-[85%] w-18 h-32 bg-[#FF1493] rounded-full blur-[55px] animate-pulse" style={{ animationDelay: "1.2s" }} />
              </div>

              {/* Main photo container with torn/jagged edge */}
              <div 
                className="relative h-full bg-card/5 backdrop-blur-sm overflow-hidden"
                style={{
                  clipPath: 'polygon(8% 0%, 5% 2%, 12% 4%, 7% 7%, 3% 9%, 10% 11%, 6% 14%, 14% 17%, 9% 20%, 16% 22%, 11% 25%, 4% 28%, 13% 31%, 8% 35%, 18% 38%, 12% 42%, 6% 45%, 15% 49%, 10% 53%, 20% 56%, 14% 60%, 8% 63%, 17% 67%, 11% 71%, 22% 74%, 16% 78%, 10% 82%, 19% 85%, 13% 89%, 24% 92%, 18% 95%, 12% 98%, 20% 100%, 100% 100%, 100% 0%)'
                }}
              >
                {/* Cracked glass overlay effect */}
                <div className="absolute inset-0 opacity-25 z-10">
                  <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF1493" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FF1493" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="crackShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0,0,0,0.2)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.8)" stopOpacity="0.9" />
                      </linearGradient>
                      <filter id="blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                      </filter>
                    </defs>
                    {/* Main slanting crack spine - jagged path for realism */}
                    <path d="M 20 60 L 40 80 L 30 100 L 50 120 L 35 140 L 55 160 L 45 180 L 65 200 L 50 220 L 70 240 L 55 260 L 75 280 L 60 300 L 80 320 L 65 340 L 85 360 L 70 380 L 90 400 L 75 420 L 95 440 L 80 460 L 100 480 L 85 500 L 105 520 L 90 540 L 110 560 L 95 580 L 115 600 L 100 620 L 120 640 L 105 660 L 125 680 L 110 700 L 130 720 L 115 740 L 135 760 L 120 780" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="2.5" 
                          opacity="0.9" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Branching jagged cracks off the main spine - left-leaning top, right-leaning bottom */}
                    
                    {/* Upper branches - shift left for top slanting feel */}
                    <path d="M 35 90 L 15 110 L 25 130 L 5 150 L 20 170" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.2" 
                          opacity="0.7" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 60 210 L 40 230 L 50 250 L 30 270 L 45 290" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1" 
                          opacity="0.6" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 80 330 L 60 350 L 70 370 L 50 390 L 65 410" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.3" 
                          opacity="0.75" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Mid branches - central */}
                    <path d="M 45 150 L 65 170 L 55 190 L 75 210 L 60 230 L 80 250" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.5" 
                          opacity="0.8" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 105 450 L 85 470 L 95 490 L 75 510 L 90 530 L 110 550" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.1" 
                          opacity="0.65" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Lower branches - shift right for bottom slanting feel */}
                    <path d="M 95 510 L 115 530 L 105 550 L 125 570 L 110 590 L 130 610" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.4" 
                          opacity="0.85" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 120 630 L 140 650 L 130 670 L 150 690 L 135 710 L 155 730" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.2" 
                          opacity="0.7" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 135 750 L 155 770 L 145 790 L 165 810" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1" 
                          opacity="0.6" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Secondary micro-cracks for shard detail - tiny jagged lines */}
                    <path d="M 50 180 L 55 185 L 48 190 L 52 195" 
                          fill="none" 
                          stroke="url(#crackShadow)" 
                          strokeWidth="0.8" 
                          opacity="0.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 75 300 L 80 305 L 73 310 L 77 315 L 70 320" 
                          fill="none" 
                          stroke="url(#crackShadow)" 
                          strokeWidth="0.6" 
                          opacity="0.4" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 100 420 L 105 425 L 98 430 L 102 435 L 95 440 L 99 445" 
                          fill="none" 
                          stroke="url(#crackShadow)" 
                          strokeWidth="0.7" 
                          opacity="0.45" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 125 540 L 130 545 L 123 550 L 127 555 L 120 560 L 124 565 L 118 570" 
                          fill="none" 
                          stroke="url(#crackShadow)" 
                          strokeWidth="0.5" 
                          opacity="0.35" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 110 660 L 115 665 L 108 670 L 112 675" 
                          fill="none" 
                          stroke="url(#crackShadow)" 
                          strokeWidth="0.9" 
                          opacity="0.55" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Additional crossing micro-cracks for dramatic shard effect */}
                    <path d="M 30 120 L 70 160 L 60 180 L 100 220" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="0.9" 
                          opacity="0.6" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 90 360 L 130 400 L 120 420 L 160 460" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="1.1" 
                          opacity="0.7" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    <path d="M 140 580 L 180 620 L 170 640 L 210 680" 
                          fill="none" 
                          stroke="url(#glassGradient)" 
                          strokeWidth="0.8" 
                          opacity="0.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round" />
                    
                    {/* Subtle background shards illusion - enhanced visibility */}
                    <polygon points="0,0 400,0 380,800 20,800" fill="url(#glassGradient)" opacity="0.15" />
                    <polygon points="50,100 150,150 120,250 20,200" fill="rgba(139, 92, 246, 0.2)" opacity="0.3" />
                    <polygon points="200,400 300,450 280,550 180,500" fill="rgba(255, 20, 147, 0.15)" opacity="0.25" />
                    <polygon points="100,600 250,650 230,750 80,700" fill="rgba(139, 92, 246, 0.1)" opacity="0.2" />
                    <polygon points="150,200 280,250 260,380 130,330" fill="rgba(255, 20, 147, 0.12)" opacity="0.28" />
                    <polygon points="180,500 320,560 300,700 160,640" fill="rgba(139, 92, 246, 0.18)" opacity="0.32" filter="url(#blur)" />
                  </svg>
                </div>

                {/* Profile Photo */}
                <img
                  src="/dalton.jpg"
                  alt="Dalton Omondi - ML Engineer & Hardware Designer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    console.error('Failed to load image');
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='800'%3E%3Crect width='400' height='800' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-weight='bold'%3EDO%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* Gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[#FF1493]/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />

                {/* Floating Skill Cards over Photo */}
                <div className="absolute bottom-8 left-8 right-8 z-30">
                  <div className="grid grid-cols-2 gap-3 animate-slide-up">
              {[
                { icon: "🧠", title: "Machine Learning", gradient: "from-primary/20 to-primary/5" },
                { icon: "⚡", title: "PCB Design", gradient: "from-[#FF1493]/20 to-[#FF1493]/5" },
                { icon: "🔬", title: "Chip Design", gradient: "from-primary/20 to-primary/5" },
                { icon: "📡", title: "IoT Systems", gradient: "from-[#FF1493]/20 to-[#FF1493]/5" },
              ].map((skill, index) => (
                    <div
                      key={skill.title}
                      className={`group relative p-3 bg-gradient-to-br ${skill.gradient} backdrop-blur-lg border border-border/50 rounded-xl hover:border-[#FF1493]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF1493]/30 hover:-translate-y-1.5`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{skill.icon}</div>
                        <h3 className="font-bold text-xs text-foreground">{skill.title}</h3>
                      </div>
                      {/* Magenta accent line on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF1493] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Mobile Photo Section - Simple and clean */}
          <div className="lg:hidden relative mt-8 mx-auto max-w-sm">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl">
              {/* Profile Photo */}
              <img
                src="/dalton.jpg"
                alt="Dalton Omondi - ML Engineer & Hardware Designer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  console.error('Failed to load image');
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect width='400' height='600' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-weight='bold'%3EDO%3C/text%3E%3C/svg%3E";
                }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              
              {/* Floating Skill Cards - Mobile optimized */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "🧠", title: "Machine Learning", gradient: "from-primary/20 to-primary/5" },
                    { icon: "⚡", title: "PCB Design", gradient: "from-[#FF1493]/20 to-[#FF1493]/5" },
                    { icon: "🔬", title: "Chip Design", gradient: "from-primary/20 to-primary/5" },
                    { icon: "📡", title: "IoT Systems", gradient: "from-[#FF1493]/20 to-[#FF1493]/5" },
                  ].map((skill) => (
                    <div
                      key={skill.title}
                      className={`p-2 bg-gradient-to-br ${skill.gradient} backdrop-blur-lg border border-border/50 rounded-lg`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="text-base">{skill.icon}</div>
                        <h3 className="font-bold text-[10px] text-foreground leading-tight">{skill.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
