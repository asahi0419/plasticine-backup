/* eslint-disable */

export const up = async (knex) => {
  if (process.env.DB_TYPE !== 'postgres') return;

  await knex.raw(`
CREATE OR REPLACE FUNCTION public.getrecordsbydistance(modelalias text, p_lat double precision, p_lon double precision, max_distance double precision, earth_radius double precision, cond text DEFAULT true)
  RETURNS TABLE(id integer, distance double precision, azimuth double precision)
  LANGUAGE plpgsql
  IMMUTABLE
AS $function$
DECLARE
  model_id integer;
BEGIN
  earth_radius:=earth_radius*1000;
  IF cond IS NULL THEN cond = TRUE; END IF;
  SELECT object_1.id INTO model_id FROM public.object_1 WHERE alias=modelAlias;
  RETURN QUERY
    EXECUTE 'SELECT id, $1 * acos(
          least(greatest(cos(radians($2)) * cos(radians(p_lat)) * cos(radians(p_lon)-radians($3)) + sin(radians($2)) * sin(radians(p_lat)), -1), 1)
        ) AS distance,
        CASE WHEN (ATAN2(
            (sin(radians($3)-radians(p_lon)) * cos(radians($2))),
            (cos(radians(p_lat))*sin(radians($2))-sin(radians(p_lat))*cos(radians($2))*cos(radians($3)-radians(p_lon)))
          ) * 180/pi()) < 0
        THEN (ATAN2(
            (sin(radians($3)-radians(p_lon)) * cos(radians($2))),
            (cos(radians(p_lat))*sin(radians($2))-sin(radians(p_lat))*cos(radians($2))*cos(radians($3)-radians(p_lon)))
          ) * 180/pi()) + 360
        ELSE (ATAN2(
            (sin(radians($3)-radians(p_lon)) * cos(radians($2))),
            (cos(radians(p_lat))*sin(radians($2))-sin(radians(p_lat))*cos(radians($2))*cos(radians($3)-radians(p_lon)))
        ) * 180/pi())
      END AS azimuth
      FROM public.object_' || model_id || '
      WHERE public.object_' || model_id || '.__inserted = TRUE AND ' || cond || '
      GROUP BY id HAVING ($1 * acos(
          least(greatest(cos(radians($2)) * cos(radians(p_lat)) * cos(radians(p_lon)-radians($3)) + sin(radians($2)) * sin(radians(p_lat)), -1), 1)
        )) <= $4
          ORDER BY id' USING earth_radius, p_lat, p_lon, max_distance;
END
$function$
;
  `);
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
