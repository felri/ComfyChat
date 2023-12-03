function Container({ children, title = "Title", classNames = "" }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 pt-6 border-2 border-gray-800 rounded-md bg-gray-900 ${classNames}`}
    >
      <h1 className="absolute top-0 left-0 flex items-center justify-center w-full text-sm text-white bg-gray-800">
        {title}
      </h1>
      {children}
    </div>
  );
}

export default Container;
