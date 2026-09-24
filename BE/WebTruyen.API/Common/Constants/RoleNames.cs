namespace WebTruyen.API.Common.Constants;

public static class RoleNames
{
    public const string Admin = "Admin";
    public const string Moderator = "Moderator";
    public const string Author = "Author";
    public const string Member = "Member";

    public static readonly IReadOnlyList<string> All = new[]
    {
        Admin,
        Moderator,
        Author,
        Member
    };
}
