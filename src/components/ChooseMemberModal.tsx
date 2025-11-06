import React, { useEffect, useRef } from "react";

export type Member = {
  id: string;
  handle: string;
  caption: string;
  avatar: string;
};

export type ChooseMemberModalProps = {
  members: Member[];
  requestsLeft: number;
  onClose: () => void;
  onDG: (memberId: string) => void;
};

const ChooseMemberModal: React.FC<ChooseMemberModalProps> = ({
  members,
  requestsLeft,
  onClose,
  onDG,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) {
          return;
        }

        const focusables = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
        );

        if (focusables.length === 0) {
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="cmm-overlay" role="presentation" onMouseDown={handleOverlayMouseDown}>
      <div
        className="cmm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="choose-member-title"
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
      >
        <style>{`
          .cmm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(12, 10, 8, 0.7);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            z-index: 999;
            font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          .cmm-panel {
            position: relative;
            width: min(92vw, 440px);
            max-height: 90vh;
            background: linear-gradient(180deg, #eae3d2 0%, #dccbb2 100%);
            border-radius: 20px;
            box-shadow: 0 14px 50px rgba(0, 0, 0, 0.45);
            padding: 28px 28px 24px;
            color: #121212;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 22px;
          }

          .cmm-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 34px;
            height: 34px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: #121212;
            font-size: 20px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
          }

          .cmm-close:hover,
          .cmm-close:focus-visible {
            background: rgba(0, 0, 0, 0.06);
            outline: none;
          }

          .cmm-header {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-right: 54px;
          }

          .cmm-title-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
          }

          .cmm-title-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          #choose-member-title {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.3px;
          }

          .cmm-subtitle {
            margin: 0;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.68);
            letter-spacing: 0.1px;
          }

          .cmm-requests-chip {
            align-self: flex-start;
            background: #e1d5c1;
            color: #121212;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.3px;
            padding: 6px 10px;
            border-radius: 999px;
            white-space: nowrap;
          }

          .cmm-members-list {
            flex: 1;
            overflow-y: auto;
            max-height: 56vh;
            padding-right: 6px;
          }

          .cmm-members-list::-webkit-scrollbar {
            width: 6px;
          }

          .cmm-members-list::-webkit-scrollbar-thumb {
            background: rgba(18, 18, 18, 0.22);
            border-radius: 6px;
          }

          .cmm-member-card {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 20px;
            background: linear-gradient(180deg, #f6ecdc 0%, #e9d9bd 100%);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 14px;
            padding: 18px 20px;
            margin-bottom: 12px;
            position: relative;
            transition: border 0.2s ease, box-shadow 0.2s ease;
            overflow: hidden;
          }

          .cmm-member-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0);
            transition: background 0.2s ease;
            pointer-events: none;
          }

          .cmm-member-card:hover {
            border-color: rgba(0, 0, 0, 0.12);
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
          }

          .cmm-member-card:hover::after {
            background: rgba(255, 255, 255, 0.25);
          }

          .cmm-avatar {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            object-fit: cover;
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
          }

          .cmm-member-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .cmm-handle {
            font-size: 18px;
            font-weight: 700;
            color: #121212;
            margin: 0;
          }

          .cmm-caption {
            margin: 0;
            font-size: 15px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.58);
            letter-spacing: 0.2px;
            font-style: italic;
          }

          .cmm-dg-button {
            width: 90px;
            height: 42px;
            border-radius: 8px;
            background: linear-gradient(180deg, #1c1c1c 0%, #000000 100%);
            border: 1px solid rgba(0, 0, 0, 0.6);
            color: #eae3d2;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: box-shadow 0.2s ease, border 0.2s ease, transform 0.1s ease;
          }

          .cmm-dg-button:hover,
          .cmm-dg-button:focus-visible {
            border: 1px solid #dec9a3;
            box-shadow: 0 0 8px rgba(222, 201, 163, 0.4);
            outline: none;
          }

          .cmm-dg-button:active {
            transform: translateY(1px);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .cmm-footer-note {
            text-align: center;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            margin-top: 4px;
          }

          @media (max-width: 820px) {
            .cmm-panel {
              padding: 24px 22px 20px;
              gap: 18px;
            }

            #choose-member-title {
              font-size: 18px;
            }

            .cmm-subtitle {
              font-size: 13px;
            }

            .cmm-avatar {
              width: 72px;
              height: 72px;
            }

            .cmm-handle {
              font-size: 16px;
            }

            .cmm-caption {
              font-size: 14px;
            }

            .cmm-dg-button {
              width: 84px;
              height: 40px;
              font-size: 11px;
            }
          }
        `}</style>

        <button
          type="button"
          className="cmm-close"
          onClick={onClose}
          aria-label="Close choose member modal"
          ref={closeButtonRef}
        >
          ×
        </button>

        <div className="cmm-header">
          <div className="cmm-title-row">
            <div className="cmm-title-block">
              <h2 id="choose-member-title">Choose a Member</h2>
              <p className="cmm-subtitle">Send a Direct Guest request to a door member.</p>
            </div>
            <div className="cmm-requests-chip">Requests left: {requestsLeft}</div>
          </div>
        </div>

        <div className="cmm-members-list" aria-label="Members list">
          {members.map((member) => (
            <article className="cmm-member-card" key={member.id}>
              <img
                src={member.avatar}
                alt={`${member.handle} avatar`}
                className="cmm-avatar"
                loading="lazy"
              />
              <div className="cmm-member-info">
                <h3 className="cmm-handle">{member.handle}</h3>
                <p className="cmm-caption">{member.caption}</p>
              </div>
              <button
                type="button"
                className="cmm-dg-button"
                onClick={() => onDG(member.id)}
                aria-label={`Send Direct Guest request to ${member.handle}`}
              >
                DG
              </button>
            </article>
          ))}
        </div>

        <p className="cmm-footer-note">Once sent, you’ll be notified when approved.</p>
      </div>
    </div>
  );
};

export default ChooseMemberModal;

/*
Mock usage:

<ChooseMemberModal
  members=[
    { id: "1", handle: "@danielv", caption: "Estate investor", avatar: "/img/m1.jpg" },
    { id: "2", handle: "@michaelr", caption: "Startupper", avatar: "/img/m2.jpg" },
    { id: "3", handle: "@emilyp", caption: "Pro athlete", avatar: "/img/m3.jpg" }
  ]
  requestsLeft={2}
  onClose={() => setOpen(false)}
  onDG={(memberId) => console.log("Send DG to", memberId)}
/>
*/
