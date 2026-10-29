/**
 * File: js/features/auth.js
 * Role: Log out and sign back in.
 * Dependencies: Loaded by index.html as script 55 of 80. Uses globals from js/components/action-dialog.js, js/core/utils.js, js/features/profile.js, js/layout/topbar.js. Nothing else calls into it; it wires itself up on load.
 */

/* LOG OUT */
const signedOutScreen = document.getElementById("signed-out-screen");

document.addEventListener("click", (e) => {
  const trigger = e.target.closest('[data-action="logout"]');
  if (!trigger) return;
  e.preventDefault();
  setProfileOpen(false);
  openActionDialog({
    title: "Log out of REOS?",
    body: '<p class="action-dialog-text">You\'ll need to sign in again to see your projects. Anything unsaved in an open form will be lost.</p>',
    submitLabel: "Log Out",
    // Front-end only: this just shows the signed-out screen; real authentication belongs to the backend
    onSubmit() {
      signedOutScreen.hidden = false;
      signedOutScreen.querySelector("[data-sign-in]").focus();
    }
  });
});

signedOutScreen.querySelector("[data-sign-in]").addEventListener("click", () => {
  signedOutScreen.hidden = true;
  showToast(`Welcome back, ${firstName(profileState.name)}.`);
});
