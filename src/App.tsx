import Nav from "./components/Nav";
import Table from "./components/Table";
import Header from "./components/Header";

const App = () => {
  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center gap-12 pb-8 md:p-7 max-w-screen-2xl mx-auto">
        <Header />
        <Table />
      </div>
    </>
  );
};

export default App;
