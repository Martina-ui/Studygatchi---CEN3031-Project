import { useState } from "react";
import "./App.css";

interface Props {
  setMoney: (money: number) => void;
  setHealth: (health: number) => void;
}

export default function ToDoList({
  setMoney,
  setHealth,
}: Props) {
  const [items, setItems] = useState([
    "Lock in time",
    "Read Chapters 2-3",
    "Write new Draft",
  ]);

  const [newItem, setNewItem] = useState("");

  const [completionResult, setCompletionResult] = useState<{
    reward: number;
    balance: number;
    hp: number | null;
  } | null>(null);

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

    setCheckedItems((prev) => ({
      ...prev,
      [newItem]: false,
    }));

    setNewItem("");
  };

  const checkItem = async (item: string) => {
    if (checkedItems[item]) {
      return;
    }

    try {
      // Demo task used until the mock frontend is connected to database tasks
      const taskId = 1;

      const response = await fetch(
        `http://localhost:8000/api/complete_task/${taskId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCheckedItems((prev) => ({
          ...prev,
          [item]: true,
        }));

        setCompletionResult({
          reward: data.reward_earned,
          balance: data.new_balance,
          hp: data.pet_hp,
        });

        // Update the existing Goober UI with values returned by the backend
        setMoney(data.new_balance);

        if (data.pet_hp !== null) {
          setHealth(data.pet_hp);
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
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

              <label htmlFor={`checkbox-${item}`}>
                {item}
              </label>
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

      {completionResult && (
        <div className="completion-result">
          <h2>Task Completed!</h2>
          <p>Reward Earned: +{completionResult.reward}</p>
          <p>Balance: {completionResult.balance}</p>
          <p>Goober HP: {completionResult.hp}</p>
        </div>
      )}
    </div>
  );
}
