const WATCHTOWER_COMMAND_REGEX = /^\/watchtower (--interval (\d+))?([\s\w]+)*/;

function parse(command) {
  // /watchtower --interval 600 nginx redis
  const args = {};
  let m;
  if ((m = WATCHTOWER_COMMAND_REGEX.exec(command)) !== null) {
    if (m.length === 4) {
      // found polling and containers
      args["pollingIntervalSecs"] = Number(m[2] ?? '86400');
      if (m[3]) {
        args["containers"] = m[3].trim().split(" ");
      }
    }
  }
  return args;
}

describe("command-parsing", () => {
  it("with interval and containers", () => {
    const args = parse("/watchtower --interval 600 nginx redis");
    expect(args.pollingIntervalSecs).toBe(600);
    expect(args.containers).toStrictEqual(["nginx", "redis"]);
  });

  it('with interval only', () => {
    const args = parse("/watchtower --interval 2000");
    expect(args.pollingIntervalSecs).toBe(2000);
    expect(args.containers).toBe(undefined);
  });

  it('with containers only', () => {
    const args = parse("/watchtower nginx redis");
    expect(args.pollingIntervalSecs).toBe(86400);
    expect(args.containers).toStrictEqual(["nginx", "redis"]);
  });
});
