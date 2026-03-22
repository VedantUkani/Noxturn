"use client";

type OnboardingStepHeaderProps = {
  title: string;
  description: string;
};

export function OnboardingStepHeader({
  title,
  description,
}: OnboardingStepHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <h2 className="text-xl font-bold tracking-tight text-[#edf2ff] sm:text-2xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#98a4bf] sm:text-[15px]">
        {description}
      </p>
    </header>
  );
}
