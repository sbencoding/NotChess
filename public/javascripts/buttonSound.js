const buttonSound = new Audio("audio/button_click_sound.mp3");
const buttons = document.querySelectorAll("button");

for(const b of buttons) {
    b.addEventListener('click', () => buttonSound.play());
}
