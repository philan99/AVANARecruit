import { Lightbulb, TrendingUp, Heart } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We drive strategic enterprise innovation by harnessing the latest in AI and data science across every product we ship.",
  },
  {
    icon: TrendingUp,
    title: "Value Driven",
    description:
      "Our approach delivers tangible results — faster outcomes, better decisions, and measurable operational efficiency.",
  },
  {
    icon: Heart,
    title: "People First",
    description:
      "Every solution is built around people, ensuring teams, customers and end users get the experience they deserve.",
  },
];

export function CoreValuesSection() {
  return (
    <section
      id="values"
      className="py-20 lg:py-28"
      style={{ backgroundColor: "#1a2035" }}
      data-testid="core-values"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#4CAF50" }}
          >
            Our Core Values
          </p>
          <h2
            className="text-3xl lg:text-[40px] font-bold leading-tight"
            style={{ color: "#ffffff" }}
          >
            Everything We Do is Underpinned
            <br className="hidden lg:block" /> by Our Core Values
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value) => (
            <div key={value.title} className="text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "rgba(76, 175, 80, 0.12)" }}
              >
                <value.icon className="w-6 h-6" style={{ color: "#4CAF50" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#ffffff" }}>
                {value.title}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-xs mx-auto"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
