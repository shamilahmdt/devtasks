import { Link } from "react-router-dom";

const DeleteHistory = () => {
  // TODO: Fetch deleted snippets history from localStorage
  const deletedList = [
    { id: 3, title: "Docker Nuke", code: "docker system prune -a --volumes -f", category: "DOCKER", deletedAt: new Date().toISOString() }
  ];

  const handleRestore = (sn) => {
    // TODO: Implement restore logic
  };

  const handlePurge = (id) => {
    // TODO: Implement permanent purge logic
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Deleted Snippets Log</h1>
      <ul>
        {deletedList.map((sn) => (
          <li key={sn.id} style={{ marginBottom: "15px" }}>
            <h3>{sn.title}</h3>
            <pre style={{ background: "#eee", padding: "10px" }}>{sn.code}</pre>
            <p>Deleted at: {new Date(sn.deletedAt).toLocaleString()}</p>
            <button onClick={() => handleRestore(sn)}>Restore</button>
            <button onClick={() => handlePurge(sn.id)} style={{ marginLeft: "10px", color: "red" }}>Purge</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "20px" }}>
        <Link to="/snippetvault">Back to Workspace</Link>
      </div>
    </div>
  );
};

export default DeleteHistory;
