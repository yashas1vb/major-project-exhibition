import { Zap, Users, Code } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Execution',
    description:
      'Run code in 10+ languages with real-time results and instant feedback for rapid development.',
    color: 'bg-orange',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description:
      'See live cursors and edits from all collaborators. Work together seamlessly as if you\'re in the same room.',
    color: 'bg-cyan',
  },
  {
    icon: Code,
    title: 'Smart Editor',
    description:
      'Monaco-powered editor with syntax highlighting, auto-completion, and intelligent code suggestions.',
    color: 'bg-green',
  },
  {
    icon: Zap,
    title: 'Secure Workspaces',
    description:
      'Your code is safe with us. Isolated environments and strict privacy controls ensure your IP is protected.',
    color: 'bg-purple',
  },
  {
    icon: Users,
    title: 'Infinite Whiteboard',
    description:
      'Brainstorm ideas, draw diagrams, and visualize concepts on an infinite canvas with your team.',
    color: 'bg-pink',
  },
  {
    icon: Code,
    title: 'Multiple Languages',
    description:
      'Support for JavaScript, Python, Java, C++, Go, Rust, and many more popular languages.',
    color: 'bg-blue',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-glow">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About CollabCode
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A powerful platform designed to bring developers together in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 card-shadow animate-fade-in-delay-${index + 1}`}
            >
              <div
                className={`w-14 h-14 rounded-full ${feature.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
              >
                <feature.icon className="w-7 h-7 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
