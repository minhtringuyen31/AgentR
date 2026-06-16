interface DemoPageProps {
  title?: string;
}

const DemoPage = ({ title = 'Demo Page' }: DemoPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/*<img*/}
      {/*  src="/media/illustrations/26.svg"*/}
      {/*  className="max-h-[220px]"*/}
      {/*  alt="Demo illustration"*/}
      {/*/>*/}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
};

export { DemoPage };
