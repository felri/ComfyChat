function Container({ children, title = "Title", className = "", innerRef }) {
  return (
    <div
      ref={innerRef}
      className={` ${className} relative flex flex-col items-left justify-start text-left p-4 pt-7 border-2 border-gray-800 rounded-md bg-gray-900`}
    >
      <h1 className="absolute top-0 left-0 flex items-center justify-center w-full text-sm text-white bg-gray-800 p-1">
        {title}
      </h1>
      {children}
    </div>
  );
}

export default Container;
