type RiasTScoreSectionTitleProps = {
  title: string;
};

export function RiasTScoreSectionTitle({ title }: RiasTScoreSectionTitleProps) {
  return (
    <h3 className="text-label-md font-bold uppercase tracking-wider text-primary underline">
      {title}
    </h3>
  );
}
