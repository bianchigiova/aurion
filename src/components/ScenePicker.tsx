import { SCENES, type Scene } from "../scenes";

interface Props {
  scene: Scene;
  onChoose: (scene: Scene) => void;
  /** Id of the element that names the picker, for screen readers. */
  labelledBy: string;
}

/**
 * One card per home-screen scene, side by side, the chosen one highlighted.
 * Used in Settings and in first-time setup.
 */
export default function ScenePicker({ scene, onChoose, labelledBy }: Props) {
  return (
    <div className="scene-picker" role="radiogroup" aria-labelledby={labelledBy}>
      {SCENES.map((s) => (
        <button
          key={s.id}
          role="radio"
          aria-checked={s.id === scene.id}
          className={`scene-option${s.id === scene.id ? " is-selected" : ""}`}
          onClick={() => onChoose(s)}
        >
          <img src={s.thumbnail} alt="" />
          <span className="scene-option-name">{s.name}</span>
          <span className="scene-option-hint">{s.description}</span>
        </button>
      ))}
    </div>
  );
}
