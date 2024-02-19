function ListFeatures() {
  const listItems = [
    "Straming Optimization",
    "Weekly Risers and Fallers",
    "Waiver Wire Recommendations",
    "Team Schedule Analysis",
  ];

	const handleClick = (item: string) => () => {
		console.log(`You clicked on ${item}`);
	};

  return (
    <>
      <h2>List Features</h2>
      <ul className="list-group">
        {listItems.map((item) => (
          <li className="list-group-item" key={item} onClick={handleClick(item)}> {item}</li>
        ))}
      </ul>
    </>
  );
}

export default ListFeatures;
