 // big memory usage when using reverb, piles up fast - not sure why! debug
  // ? lol because you had created a new reverb instance for every single note, dumbass
  const play = () => {
    const now = Tone.now();
    instrument.triggerAttackRelease(randomPitch(), "1m", now + 0.2);
  }

function randomPitch() {
    const pitches = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const pitch = pitches[Math.floor(Math.random() * 7 )]; // 1 - 7
    const register = Math.floor(Math.random() * (7 - 2 + 1) ) + 2; // between 2 and 7 inclusive
    return pitch + register.toString();
  }
  
  function sampler() {
    return new Tone.Sampler({
      urls: {
        "F2": "key01.mp3",
        "F#2": "key02.mp3",
        "G2": "key03.mp3",
        "G#2": "key04.mp3",
        "A2": "key05.mp3",
        "A#2": "key06.mp3",
        "B2": "key07.mp3",
        "C3": "key08.mp3",
        "C#3": "key09.mp3",
        "D3": "key10.mp3",
        "D#3": "key11.mp3",
        "E3": "key12.mp3",
        "F3": "key13.mp3",
        "F#3": "key14.mp3",
        "G3": "key15.mp3",
        "G#3": "key16.mp3",
        "A3": "key17.mp3",
        "A#3": "key18.mp3",
        "B3": "key19.mp3",
        "C4": "key20.mp3",
        "C#4": "key21.mp3",
        "D4": "key22.mp3",
        "D#4": "key23.mp3",
        "E4": "key24.mp3",
        "C1": "Piano.mf.C1.mp3",
        "Db1": "Piano.mf.Db1.mp3",
        "Eb1": "Piano.mf.Eb1.mp3",
        "F1": "Piano.mf.F1.mp3",
        "G1": "Piano.mf.G1.mp3",
        "Ab1": "Piano.mf.Ab1.mp3",
        "Bb1": "Piano.mf.Bb1.mp3",
        "C2": "Piano.mf.C2.mp3",
        "Eb2": "Piano.mf.Eb2.mp3",
        "E2": "Piano.mf.E2.mp3",
        "G4": "Piano.mf.G4.mp3",
        "F4": "Piano.mf.F4.mp3",
        "B4": "Piano.mf.B4.mp3",
        "Eb5": "Piano.mf.Eb5.mp3",
        "Gb5": "Piano.mf.Gb6.mp3",
        "Ab5": "Piano.mf.Ab6.mp3",
        "A5": "Piano.mf.A5.mp3",
        "Db6": "Piano.mf.Db6.mp3",
        "C6": "Piano.mf.C6.mp3",
        "Eb6": "Piano.mf.Eb6.mp3",
        "F6": "Piano.mf.F6.mp3",
        "Gb6": "Piano.mf.Gb6.mp3",
        "Ab6": "Piano.mf.Ab6.mp3",
        "A6": "Piano.mf.A6.mp3",
        "Bb6": "Piano.mf.Bb6.mp3",
        "C7": "Piano.mf.C7.mp3",
        "D7": "Piano.mf.D7.mp3",
        "Eb7": "Piano.mf.Eb7.mp3",
        "C8": "Piano.mf.C8.mp3",
      },
      baseUrl: "/piano_samples/"
    }).toDestination();
  }

  // n by n grid
  const createGrid = (n) => {
    let tone = document.getElementById("Tone");
    let grid = document.createElement("div");
    grid.className = "grid";
    grid.style.maxWidth = "90vw";
    grid.style.maxHeight = "90vh"
    var c = 0;
    while (c < n) {
      grid.appendChild(createGridRow(n, c));
      c += 1;
    }
    tone.appendChild(grid);
  }

  const createGridRow = (n, counter) => {
    let row = document.createElement("div");
    row.id = "row" + counter;
    row.className = "rowClass";
    var p = 0;
    while (p < n) {
      var box = document.createElement('div');
      box.id = "box" + n + "-" + counter;
      box.addEventListener("mouseover", play);
      box.className = "boxClass";
      box.style.width = "20vw";
      box.style.height = "20vh"
      row.appendChild(box);
      p += 1;
    }
    return row;
  }

  const initialize = async () => {
    await Tone.start();
    createGrid(4);
  }

  async function loadInstrument() {
    instrument = sampler();
    reverb = new Tone.Reverb(3).toDestination();
    instrument.connect(reverb);
    await Tone.loaded();
  }

  <div id="Tone">
      <button onClick={initialize} disabled>Initialize Grid</button>
    </div>