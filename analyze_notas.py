"""Herramienta para analizar relaciones entre notas y resoluciones.

Este script combina distintos archivos Excel con las notas del proyecto SG668 y
detecta relaciones explícitas e implícitas entre documentos para generar un
listado normalizado y grafos de relaciones.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

import matplotlib.pyplot as plt
import networkx as nx
import pandas as pd


TEXT_COLUMNS = [
    "NombreArchivo",
    "Referencia",
    "Resumen",
    "Categoria",
    "Comentarios",
]

RELATION_PATTERNS: Sequence[Tuple[str, str]] = (
    (r"\bRES[\s_-]*(\d+)\b", "Ref RES"),
    (r"\bNota\s*SG\s*(\d+)\b", "Ref Nota"),
    (r"\bNota\s*(\d+)\b", "Ref Nota"),
    (r"\bResp(?:uesta)?\s*(?:Nota|SG)?\s*(\d+)\b", "Resp Nota"),
)


def load_excels(paths: Iterable[str]) -> pd.DataFrame:
    frames: List[pd.DataFrame] = []
    for path in paths:
        excel_path = Path(path)
        if not excel_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo: {excel_path}")
        df = pd.read_excel(excel_path)
        df["__archivo_origen"] = excel_path.name
        frames.append(df)

    if not frames:
        raise ValueError("No se proporcionaron archivos Excel válidos.")

    combined = pd.concat(frames, ignore_index=True)
    for column in TEXT_COLUMNS + ["NumeroNotaPedido", "Responde a Nota", "NombreArchivo"]:
        if column not in combined.columns:
            combined[column] = ""
    return combined


def first_number(value: object) -> Optional[str]:
    if pd.isna(value):
        return None
    match = re.search(r"(\d+)", str(value))
    return match.group(1) if match else None


def extract_origin_info(row: pd.Series) -> Tuple[Optional[str], str]:
    numero = first_number(row.get("NumeroNotaPedido"))
    if not numero:
        nombre = str(row.get("NombreArchivo", ""))
        nota_match = re.search(r"Nota\s*(\d+)", nombre, re.IGNORECASE)
        if nota_match:
            numero = nota_match.group(1)
    codigo = str(row.get("NumeroNotaPedido") or row.get("NombreArchivo") or "")
    return numero, codigo


def extract_text_relations(text: str) -> List[Tuple[str, str, Optional[str]]]:
    relations: List[Tuple[str, str, Optional[str]]] = []
    if not text:
        return relations
    lowered_text = str(text)
    for pattern, relation_type in RELATION_PATTERNS:
        for match in re.finditer(pattern, lowered_text, flags=re.IGNORECASE):
            full = match.group(0).strip()
            number = match.group(1) if match.groups() else None
            relations.append((relation_type, full, number))
    return relations


def build_relations(df: pd.DataFrame) -> pd.DataFrame:
    records: List[dict] = []
    for _, row in df.iterrows():
        origen_num, origen_codigo = extract_origin_info(row)
        nombre_archivo = row.get("NombreArchivo") or row.get("__archivo_origen") or ""

        responde_a = row.get("Responde a Nota")
        if pd.notna(responde_a) and str(responde_a).strip():
            destino_texto = str(responde_a).strip()
            records.append(
                {
                    "OrigenNotaNum": origen_num,
                    "OrigenCodigo": origen_codigo,
                    "TipoRelacion": "RespondeA",
                    "DestinoTexto": destino_texto,
                    "DestinoNum": first_number(destino_texto),
                    "Fuente": "Responde a Nota",
                    "NombreArchivo": nombre_archivo,
                }
            )

        for column in TEXT_COLUMNS:
            valor = row.get(column)
            if pd.isna(valor):
                continue
            for tipo, texto, numero in extract_text_relations(str(valor)):
                records.append(
                    {
                        "OrigenNotaNum": origen_num,
                        "OrigenCodigo": origen_codigo,
                        "TipoRelacion": tipo,
                        "DestinoTexto": texto,
                        "DestinoNum": numero,
                        "Fuente": f"Campo {column}",
                        "NombreArchivo": nombre_archivo,
                    }
                )

    if not records:
        return pd.DataFrame(
            columns=[
                "OrigenNotaNum",
                "OrigenCodigo",
                "TipoRelacion",
                "DestinoTexto",
                "DestinoNum",
                "Fuente",
                "NombreArchivo",
            ]
        )
    return pd.DataFrame.from_records(records)


def node_label_from_relation(row: pd.Series) -> Tuple[Optional[str], Optional[str]]:
    origen_label = None
    if row.get("OrigenNotaNum"):
        origen_label = f"Nota {row['OrigenNotaNum']}"
    elif row.get("OrigenCodigo"):
        origen_label = str(row["OrigenCodigo"])

    destino_label = None
    destino_num = row.get("DestinoNum")
    tipo = row.get("TipoRelacion")
    if destino_num:
        if tipo == "Ref RES":
            destino_label = f"RES {destino_num}"
        else:
            destino_label = f"Nota {destino_num}"
    elif row.get("DestinoTexto"):
        destino_label = str(row["DestinoTexto"])
    return origen_label, destino_label


def draw_graph(G: nx.DiGraph, path: Path, title: str) -> None:
    if not G.nodes:
        print(f"No hay nodos para dibujar en {path}.")
        return
    plt.figure(figsize=(12, 9))
    pos = nx.spring_layout(G, seed=42)
    nx.draw_networkx_nodes(G, pos, node_color="#1976d2", alpha=0.85)
    nx.draw_networkx_labels(G, pos, font_size=8, font_color="white")
    nx.draw_networkx_edges(G, pos, edge_color="#424242", arrows=True, arrowsize=15)
    edge_labels = {}
    for u, v, data in G.edges(data=True):
        etiquetas = data.get("TipoRelacion", [])
        if isinstance(etiquetas, set):
            etiqueta = ", ".join(sorted(etiquetas))
        elif isinstance(etiquetas, list):
            etiqueta = ", ".join(etiquetas)
        else:
            etiqueta = str(etiquetas)
        edge_labels[(u, v)] = etiqueta
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=7)
    plt.title(title)
    plt.axis("off")
    plt.tight_layout()
    plt.savefig(path, dpi=300)
    plt.close()


def build_graph(relations: pd.DataFrame) -> nx.DiGraph:
    G = nx.DiGraph()
    for _, row in relations.iterrows():
        origen_label, destino_label = node_label_from_relation(row)
        if not origen_label or not destino_label:
            continue
        G.add_node(origen_label)
        G.add_node(destino_label)
        if G.has_edge(origen_label, destino_label):
            existing = G[origen_label][destino_label].setdefault("TipoRelacion", set())
            if isinstance(existing, set):
                existing.add(row["TipoRelacion"])
            else:
                G[origen_label][destino_label]["TipoRelacion"] = {existing, row["TipoRelacion"]}
        else:
            G.add_edge(origen_label, destino_label, TipoRelacion={row["TipoRelacion"]})
    return G


def main(args: Optional[Sequence[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="Analiza notas del proyecto SG668")
    parser.add_argument(
        "excels",
        nargs="+",
        help="Rutas de los archivos Excel con las notas (mínimo 2).",
    )
    parser.add_argument(
        "--salida-relaciones",
        default="relaciones_notas_profundo.xlsx",
        help="Nombre del archivo Excel de salida.",
    )
    parser.add_argument(
        "--grafo-completo",
        default="grafo_relaciones.png",
        help="Nombre del PNG para el grafo completo.",
    )
    parser.add_argument(
        "--grafo-n166",
        default="grafo_relaciones_n166.png",
        help="Nombre del PNG para el grafo centrado en la Nota 166.",
    )

    parsed = parser.parse_args(args)
    data = load_excels(parsed.excels)
    relations = build_relations(data)

    output_path = Path(parsed.salida_relaciones)
    relations.to_excel(output_path, index=False)
    print(f"Se exportaron {len(relations)} relaciones a {output_path}.")

    graph = build_graph(relations)
    draw_graph(graph, Path(parsed.grafo_completo), "Grafo completo de relaciones")

    target_node = "Nota 166"
    if target_node in graph:
        undirected = graph.to_undirected()
        component_nodes = nx.node_connected_component(undirected, target_node)
        subgraph = graph.subgraph(component_nodes).copy()
        draw_graph(subgraph, Path(parsed.grafo_n166), "Componente alrededor de Nota 166")
    else:
        print("Nota 166 no encontrada en el grafo; no se genera grafo específico.")


if __name__ == "__main__":
    main()
