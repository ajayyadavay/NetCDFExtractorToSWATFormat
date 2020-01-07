## ----setup, include = FALSE----------------------------------------------
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>"
)

## ------------------------------------------------------------------------
pos.vec <- c(
  "chr10:213,054,000-213,055,000",
  "chrM:111,000",
  "chr1:110-111 chr2:220-222") # two possible matches.

## ------------------------------------------------------------------------
(chr.dt <- nc::capture_first_vec(
  pos.vec, 
  chrom="chr.*?",
  ":",
  chromStart="[0-9,]+"))
str(chr.dt)

## ------------------------------------------------------------------------
keep.digits <- function(x)as.integer(gsub("[^0-9]", "", x))
(int.dt <- nc::capture_first_vec(
  pos.vec, 
  chrom="chr.*?",
  ":",
  chromStart="[0-9,]+", keep.digits))
str(int.dt)

## ------------------------------------------------------------------------
pos.pattern <- list("[0-9,]+", keep.digits)
range.pattern <- list(
  chrom="chr.*?",
  ":",
  chromStart=pos.pattern,
  list(
    "-",
    chromEnd=pos.pattern
  ), "?")
nc::capture_first_vec(pos.vec, range.pattern)

## ------------------------------------------------------------------------
nc::var_args_list(range.pattern)

## ------------------------------------------------------------------------
nc::capture_first_vec(bad.vec, range.pattern, nomatch.error=FALSE)

## ------------------------------------------------------------------------
(sacct.df <- data.frame(
  Elapsed = c(
    "07:04:42", "07:04:42", "07:04:49",
    "00:00:00", "00:00:00"),
  JobID=c(
    "13937810_25",
    "13937810_25.batch",
    "13937810_25.extern",
    "14022192_[1-3]",
    "14022204_[4]"),
  stringsAsFactors=FALSE))

## ------------------------------------------------------------------------
int.pattern <- list("[0-9]+", as.integer)
range.pattern <- list(
  "\\[",
  task1=int.pattern,
  list(
    "-",#begin optional end of range.
    taskN=int.pattern
  ), "?", #end is optional.
  "\\]")
nc::capture_first_df(sacct.df, JobID=range.pattern, nomatch.error=FALSE)

## ------------------------------------------------------------------------
task.pattern <- list(
  "_",
  list(
    task=int.pattern,
    "|",#either one task(above) or range(below)
    range.pattern))
nc::capture_first_df(sacct.df, JobID=task.pattern)

## ------------------------------------------------------------------------
job.pattern <- list(
  job=int.pattern,
  task.pattern,
  list(
    "[.]",
    type=".*"
  ), "?")
nc::capture_first_df(sacct.df, JobID=job.pattern)

## ------------------------------------------------------------------------
elapsed.pattern <- list(
  hours=int.pattern,
  ":",
  minutes=int.pattern,
  ":",
  seconds=int.pattern)
nc::capture_first_df(sacct.df, JobID=job.pattern, Elapsed=elapsed.pattern)

