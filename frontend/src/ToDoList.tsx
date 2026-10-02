import { useState } from "react";
import "./App.css";

export default function ToDoList() {
  const [items, setItems] = useState([
    "Lock in time",
    "Read Chapters 2-3",
    "Write new Draft",
  ]);
  const [newItem, setNewItem] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    () =>
      items.reduce((acc, item) => {
        acc[item] = false;
        return acc;
      }, {} as Record<string, boolean>)
  );

  const addItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newItem.trim()) return;

    setItems((prev) => [...prev, newItem]);
    setCheckedItems((prev) => ({ ...prev, [newItem]: false }));
    setNewItem("");
  };

  const checkItem = async (item: string) => {
    const isNowChecked = !checkedItems[item];
    setCheckedItems((prev) => ({ ...prev, [item]: isNowChecked }));

    if (isNowChecked) {
      try {
        const taskId = 1; 
        
        const response = await fetch(`http://localhost:8000/api/complete_task/${taskId}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Success! Reward: ${data.reward_earned}, Goober HP: ${data.pet_hp}`);
        } else {
          console.error("Failed to complete task on the backend.");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  const removeItem = (item: string) => {
    setItems((prev) => prev.filter((i) => i !== item));
    setCheckedItems((prev) => {
      const copy = { ...prev };
      delete copy[item];
      return copy;
    });
  };

  return (
    <div>
      <div className="todolist-logo">
        <h1>Goober To Do List</h1>
      </div>

      <form className="Add-item" onSubmit={addItem}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button className="todolist-addItem" type="submit">
          Add
        </button>
      </form>

      <ul
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          listStyleType: "none",
          padding: 0,
        }}
      >
        {items.map((item) => (
          <li key={item} className="todolist-item">
            <div className="wrapper">
              <input
                type="checkbox"
                id={`checkbox-${item}`}
                name={item}
                checked={checkedItems[item]}
                onChange={() => checkItem(item)}
              />
              <label htmlFor={`checkbox-${item}`}>{item}</label>
            </div>
            <button
              className="todolist-trashbutton"
              onClick={() => removeItem(item)}
            >
              Del
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
