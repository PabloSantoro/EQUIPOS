# EQUIPOS

## Análisis de notas SG668

El script `analyze_notas.py` combina múltiples archivos Excel con las notas del
proyecto SG668, detecta referencias explícitas e implícitas entre los documentos
y genera:

1. Un Excel normalizado (`relaciones_notas_profundo.xlsx`) con todas las
   relaciones detectadas.
2. Un grafo completo de relaciones (`grafo_relaciones.png`).
3. Un grafo específico para la componente conexa de la Nota 166
   (`grafo_relaciones_n166.png`).

### Requisitos

- Python 3.10+
- Paquetes: `pandas`, `openpyxl`, `networkx`, `matplotlib`.

Instalación sugerida:

```bash
pip install pandas openpyxl networkx matplotlib
```

### Uso

```bash
python analyze_notas.py notas_1.xlsx notas_2.xlsx [notas_extra.xlsx ...]
```

Argumentos opcionales:

- `--salida-relaciones`: nombre del Excel con las relaciones.
- `--grafo-completo`: nombre del PNG del grafo completo.
- `--grafo-n166`: nombre del PNG del grafo alrededor de la Nota 166.

El script detecta relaciones explícitas desde la columna **Responde a Nota** y
referencias textuales profundas en los campos: NombreArchivo, Referencia,
Resumen, Categoria y Comentarios.

