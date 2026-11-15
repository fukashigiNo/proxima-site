"use client";

/**
 * Дешёвое освещение без карты окружения: генерация PMREM и её шейдеры — самая дорогая часть
 * инициализации сцены на слабых устройствах. Полусферный свет даёт мягкое заполнение.
 */
export function SceneLights() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#8a8a85", 1.6]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.8} />
    </>
  );
}
