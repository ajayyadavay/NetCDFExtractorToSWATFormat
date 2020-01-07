## ----setup, include = FALSE----------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

## ------------------------------------------------------------------------
trackDb.txt.gz <- system.file(
  "extdata", "trackDb.txt.gz", package="nc")
trackDb.vec <- readLines(trackDb.txt.gz)

## ------------------------------------------------------------------------
cat(trackDb.vec[78:107], sep="\n")

## ------------------------------------------------------------------------
tracks.dt <- nc::capture_all_str(
  trackDb.vec, 
  "track ",
  track="\\S+",
  fields="(?:\n[^\n]+)*",
  "\n")
str(tracks.dt)

## ------------------------------------------------------------------------
tracks.dt[, .(track, fields.start=substr(fields, 1, 30))]

## ------------------------------------------------------------------------
(fields.dt <- tracks.dt[, nc::capture_all_str(
  fields,
  "\\s+",
  variable=".*?",
  " ",
  value="[^\n]+"),  
  by=track])
str(fields.dt)

## ------------------------------------------------------------------------
fields.dt[
  J("tcell_McGill0107Coverage", "bigDataUrl"),
  value,
  on=.(track, variable)]
fields.dt[, .(count=.N), by=variable][order(count)]

## ------------------------------------------------------------------------
cell.sample.type <- list(
  cellType="[^ ]*?",
  "_",
  sampleName=list(
    "McGill",
    sampleID="[0-9]+", as.integer),
  dataType="Coverage|Peaks")
nc::capture_all_str(trackDb.vec, cell.sample.type)

## ------------------------------------------------------------------------
sample.or.anything <- list(
  cell.sample.type,
  "|",
  "[^\n]+")
track.pattern.old <- list(
  "track ",
  track=sample.or.anything)
nc::capture_all_str(trackDb.vec, track.pattern.old)

## ------------------------------------------------------------------------
track.pattern <- nc::field("track", " ", sample.or.anything)
nc::capture_all_str(trackDb.vec, track.pattern)

## ------------------------------------------------------------------------
any.lines.pattern <- "(?:\n[^\n]+)*"
nc::capture_all_str(
  trackDb.vec,
  track.pattern,
  any.lines.pattern,
  "\\s+",
  nc::field("type", " ", "[^\n]+"))

## ------------------------------------------------------------------------
info.txt.gz <- system.file(
  "extdata", "SweeD_Info.txt.gz", package="nc")
info.vec <- readLines(info.txt.gz)
info.vec[20:50]

## ------------------------------------------------------------------------
report.txt.gz <- system.file(
  "extdata", "SweeD_Report.txt.gz", package="nc")
report.vec <- readLines(report.txt.gz)
cat(report.vec[1:10], sep="\n")
cat(report.vec[1000:1010], sep="\n")

## ------------------------------------------------------------------------
(info.dt <- nc::capture_all_str(
  info.vec,
  "Alignment ",
  alignment="[0-9]+",
  "\n\n\t\tChromosome:\t\t",
  chrom=".*",
  "\n"))

## ------------------------------------------------------------------------
(report.dt <- nc::capture_all_str(
  report.vec,
  "//",
  alignment="[0-9]+",
  "\n",
  csv="[^/]+"
)[, {
  data.table::fread(text=csv)
}, by=alignment])

## ------------------------------------------------------------------------
(join.dt <- report.dt[info.dt, on=.(alignment)])

## ------------------------------------------------------------------------
join.dt[, .(
  chrom,
  chromStart=as.integer(Position-1),
  chromEnd=as.integer(Position),
  Likelihood)]

