function subjectList = importSubjectList(path)

    opts = delimitedTextImportOptions("NumVariables", 1);

    % Specify range and delimiter
    opts.DataLines = [2, Inf];
    opts.Delimiter = ",";

    % Specify column names and types
    opts.VariableNames = "subject";
    opts.VariableTypes = "string";

    % Specify file level properties
    opts.ExtraColumnsRule = "ignore";
    opts.EmptyLineRule = "read";

    % Specify variable properties
    opts = setvaropts(opts, "subject", "WhitespaceRule", "preserve");
    opts = setvaropts(opts, "subject", "EmptyFieldRule", "auto");

    % Import the data
    subjectList = readtable(path, opts);

    clear opts
end

