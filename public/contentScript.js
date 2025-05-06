let listening = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "Started") {
    listening = true;
    sendResponse({ status: "OK" });
  } else if (msg.type === "Stopped") {
    listening = false;
    sendResponse({ status: "OK" });
  }
});

document.addEventListener("mouseup", (e) => {
  if (!listening || !e.ctrlKey) return;

  let textSelected = window.getSelection().toString().trim();
  if (!textSelected) return;

  textSelected = textSelected
    .replace(/÷/g, "/")
    .replace(/−|\u2014|\u2013/g, "-")
    .replace(/[×x]/g, "*");

  document.querySelectorAll(".math-icon").forEach((el) => el.remove());

  const icon = document.createElement("div");
  icon.textContent = "output";
  Object.assign(icon.style, {
    color: "#000",
    position: "absolute",
    top: `${e.pageY}px`,
    left: `${e.pageX}px`,
    background: "#fff",
    padding: "2px 5px",
    cursor: "pointer",
    border: "1px solid #000",
    borderRadius: "3px",
    zIndex: 100000,
  });
  icon.className = "math-icon";
  document.body.appendChild(icon);

  chrome.runtime.sendMessage({
    type: "Pending",
    text: textSelected,

    result: null,
  });

  icon.addEventListener("click", async () => {
    let Output = "Error";
    try {
      const response = await fetch("https://api.mathjs.org/v4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expr: textSelected }),
      });
      const data = await response.json();
      Output = data.result;
    } catch (error) {
      console.error(error);
    }
    icon.textContent = `done ${textSelected} = ${Output}`;
    icon.style.padding = "10px";
    icon.style.background = "#fff";

    chrome.runtime.sendMessage({
      type: "Done",
      text: textSelected,

      result: Output,
    });
  });
});
