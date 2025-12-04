import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a collaborative coding session?',
    answer:
      'Click the "Create" button, enter a room name, select your preferred programming language, and share the room ID with your collaborators.',
  },
  {
    question: 'What programming languages are supported?',
    answer:
      'We support JavaScript, Python, C++, Java, C, Go, Rust, PHP, and Ruby with real-time code execution capabilities.',
  },
  {
    question: 'Can I see who\'s editing the code in real-time?',
    answer:
      'Yes! You can see live cursors, user presence indicators, and real-time edits from all participants in the session.',
  },
  {
    question: 'How do I join an existing coding room?',
    answer:
      'Simply click the "Join" button and enter the room ID shared by the room creator to instantly join the collaborative session.',
  },
  {
    question: 'Is my code execution secure?',
    answer:
      'Yes, all code is executed in isolated sandboxed environments to ensure security and prevent unauthorized access.',
  },
  {
    question: 'Is CollabCode free to use?',
    answer:
      'Yes, CollabCode offers a generous free tier for individuals and small teams. We also have premium plans for advanced features.',
  },
  {
    question: 'Can I save my work?',
    answer:
      'Absolutely! Your workspaces and whiteboards are automatically saved to the cloud, so you can pick up where you left off.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'No, CollabCode runs entirely in your browser. No downloads or installations required.',
  },
];

export function FAQSection() {
  return (
    <section id="faqs" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about CollabCode
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 card-shadow"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border border-primary/50 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
