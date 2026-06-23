import { Card } from "@/components/ui/card";
import { Cpu, Zap, Lightbulb, Code2 } from "lucide-react";
import profileData from "@/data/profile.json";
import GitHubStats from "./GitHubStats";

const About = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Cpu":
        return <Cpu className="h-6 w-6" />;
      case "Zap":
        return <Zap className="h-6 w-6" />;
      case "Code2":
        return <Code2 className="h-6 w-6" />;
      case "Lightbulb":
        return <Lightbulb className="h-6 w-6" />;
      default:
        return <Cpu className="h-6 w-6" />;
    }
  };

  const skills = profileData.skills.map(skill => ({
    ...skill,
    icon: getIcon(skill.icon)
  }));

  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden bg-background z-10">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent hidden md:block" />
      
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 lg:space-y-20">
          {/* Section header with creative layout */}
          <div className="grid lg:grid-cols-5 gap-6 md:gap-8 items-center">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="inline-block">
                <div className="text-xs md:text-sm font-mono text-primary mb-2">{'<about>'}</div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                  The
                  <span className="block bg-gradient-to-r from-[hsl(30,90%,58%)] to-[hsl(20,85%,55%)] bg-clip-text text-transparent">Intersection</span>
                </h2>
                <div className="text-xs md:text-sm font-mono text-primary mt-2">{'</about>'}</div>
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Where <span className="font-bold text-primary">software intelligence</span> meets{" "}
                <span className="font-bold text-accent">physical reality</span> — that's where I build.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                I'm an engineer who finds beauty in both abstraction and tangibility. My work spans from training 
                neural networks that see and understand, to designing circuit boards that bring those models into the real world.
              </p>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Story column */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="relative p-5 md:p-8 bg-card/30 backdrop-blur-sm border border-border rounded-2xl md:rounded-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="relative space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    My Approach
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {profileData.about.approach}
                  </p>
                </div>
              </div>

              <div className="relative p-5 md:p-8 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border border-border rounded-2xl md:rounded-3xl">
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    What I'm Looking For
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {profileData.about.lookingFor}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profileData.about.lookingForTags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beyond Engineering */}
              <div className="relative p-5 md:p-8 bg-secondary/30 border border-border rounded-2xl md:rounded-3xl overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                <div className="relative space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold">Beyond Engineering</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {profileData.about.beyond}
                  </p>
                </div>
              </div>

              {/* Live GitHub & Kaggle Metrics */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-wider">Live Analytics & Standings</h3>
                <GitHubStats />
              </div>
            </div>

            {/* Skills sidebar */}
            <div className="space-y-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                <h3 className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-wider">Core Expertise</h3>
                {skills.map((skill, index) => (
                  <div
                    key={skill.title}
                    className="group relative p-4 md:p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl md:rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-xl md:rounded-2xl transition-opacity" />
                    <div className="relative space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          {skill.icon}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          0{index + 1}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-foreground">{skill.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
