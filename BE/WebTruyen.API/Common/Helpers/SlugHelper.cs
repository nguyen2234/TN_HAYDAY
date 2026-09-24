using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace WebTruyen.API.Common.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string phrase)
    {
        if (string.IsNullOrWhiteSpace(phrase))
            return string.Empty;

        string str = phrase.ToLowerInvariant();

        // Convert Vietnamese accented characters
        str = RemoveDiacritics(str);

        // Replace invalid chars
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");

        // Convert multiple spaces into one space
        str = Regex.Replace(str, @"\s+", " ").Trim();

        // Cut and trim
        str = str.Substring(0, str.Length <= 100 ? str.Length : 100).Trim();

        // Replace spaces with hyphens
        str = Regex.Replace(str, @"\s", "-");

        return str;
    }

    private static string RemoveDiacritics(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        string result = stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        result = result.Replace("đ", "d").Replace("Đ", "d");
        return result;
    }
}
