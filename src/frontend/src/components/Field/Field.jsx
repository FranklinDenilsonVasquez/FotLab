import YardLine from "../YardLine/YardLine";

const Field = () => {
  const lines = Array.from({ length: 7 }, (_, i) => i);

  return (
    <div className="box-border flex h-full w-full flex-col justify-between border-x-2 border-white bg-field py-2.5">
      {lines.map((_, idx) => (
        <YardLine key={idx} />
      ))}
    </div>
  );
};

export default Field;
